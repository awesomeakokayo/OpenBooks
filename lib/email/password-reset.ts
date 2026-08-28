import { prisma } from "@/lib/db/prisma";
import { RESEND_FROM, resend } from "@/lib/email/resend";
import { randomBytes } from "node:crypto";

const TOKEN_TTL_MS = 60 * 60 * 1000;
const PREFIX = "password-reset:";

function resetUrl(token: string) {
  const baseUrl = process.env.APP_URL || process.env.AUTH_URL || "http://localhost:3000";
  return `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>\"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char] || char);
}

export async function createPasswordResetToken(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_MS);
  const identifier = `${PREFIX}${userId}`;

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return token;
}

export async function sendPasswordResetEmail({
  to,
  name,
  token,
}: {
  to: string;
  name: string;
  token: string;
}) {
  if (!resend || !process.env.RESEND_FROM_EMAIL) {
    throw new Error("Email service is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.");
  }

  const url = resetUrl(token);
  const safeName = escapeHtml(name || "there");

  const { error } = await resend.emails.send({
    from: RESEND_FROM,
    to,
    subject: "Reset your OpenBooks password",
    text: `Hi ${name || "there"},\n\nReset your OpenBooks password using this link:\n\n${url}\n\nThis link expires in 1 hour. If you did not request a password reset, you can ignore this email.`,
    html: `<!doctype html><html><body style="margin:0;background:#F8F8F6;font-family:Arial,sans-serif;color:#503047"><div style="max-width:560px;margin:40px auto;padding:32px;background:#fff;border:1px solid #E5E3DF;border-radius:20px"><div style="font-size:24px;font-weight:700;margin-bottom:24px">OpenBooks</div><h1 style="font-size:28px;line-height:1.1;margin:0 0 16px">Reset your password</h1><p style="font-size:16px;line-height:1.6;color:#6F6670">Hi ${safeName}, use the button below to choose a new OpenBooks password.</p><p style="margin:28px 0"><a href="${url}" style="display:inline-block;background:#C05746;color:#fff;text-decoration:none;padding:14px 20px;border-radius:12px;font-weight:700">Reset password</a></p><p style="font-size:13px;line-height:1.6;color:#918A91">This link expires in 1 hour. If you did not request this, you can ignore this email.</p></div></body></html>`,
  });

  if (error) throw new Error(`Failed to send password reset email: ${error.message}`);
}

export function passwordResetIdentifier(userId: string) {
  return `${PREFIX}${userId}`;
}
