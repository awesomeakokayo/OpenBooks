import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, LIMITS, rateLimitHeaders } from "@/lib/security/rateLimit";
import { createEmailVerificationToken, sendVerificationEmail } from "@/lib/email/verification";
import { logError, userError } from "@/lib/security/error";

const resendSchema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const parsed = resendSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return userError("Enter a valid email address", 400);

  const email = parsed.data.email.toLowerCase().trim();
  const rl = await checkRateLimit(`verify-resend:${ip}:${email}`, LIMITS.verifyEmail);
  if (!rl.allowed) {
    const response = userError("Too many requests. Please try again shortly.", 429);
    Object.entries(rateLimitHeaders(rl.remaining, rl.resetAt)).forEach(([key, value]) => response.headers.set(key, String(value)));
    return response;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.emailVerified) return NextResponse.json({ ok: true, message: "If that account needs verification, a new email has been sent." });
    const token = await createEmailVerificationToken(user.id);
    await sendVerificationEmail({ to: user.email, name: user.name || "there", token });
    return NextResponse.json({ ok: true, message: "Verification email sent." });
  } catch (error) {
    const id = logError("verify-email-resend", error, { ip });
    return userError("Could not resend verification email", 500, id);
  }
}
