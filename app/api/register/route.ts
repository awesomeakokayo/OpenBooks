import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { checkRateLimit, LIMITS, rateLimitHeaders } from "@/lib/security/rateLimit";
import { logError } from "@/lib/security/error";
import { createEmailVerificationToken, sendVerificationEmail } from "@/lib/email/verification";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
  phone: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match" });
  }
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = await checkRateLimit(`register:${ip}`, LIMITS.register);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many attempts, try again shortly" }, { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) });
  }

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json({ error: firstIssue?.message || "Please check your information" }, { status: 400 });
    }

    const { name, email, password, phone } = parsed.data;
    const lowerEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: lowerEmail } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered. Sign in or resend your verification email." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email: lowerEmail, password: hashed, phone: phone || null } });

    try {
      const token = await createEmailVerificationToken(user.id);
      await sendVerificationEmail({ to: user.email, name: user.name || "there", token });
    } catch (emailError) {
      logError("register-email", emailError, { ip, userId: user.id });
      return NextResponse.json({ error: "Your account was created, but we could not send the verification email. Please use the resend option.", verificationRequired: true, email: user.email }, { status: 503 });
    }

    return NextResponse.json({ id: user.id, email: user.email, verificationRequired: true }, { status: 201 });
  } catch (e) {
    const id = logError("register", e, { ip: req.headers.get("x-forwarded-for") });
    return NextResponse.json({ error: "Could not create account", requestId: id }, { status: 500 });
  }
}
