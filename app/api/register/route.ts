import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { checkRateLimit, LIMITS, rateLimitHeaders } from "@/lib/security/rateLimit";
import { logError, requestId, userError } from "@/lib/security/error";
import { createEmailVerificationToken, sendVerificationEmail } from "@/lib/email/verification";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
  phone: z.string().trim().max(20).optional(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match" });
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = await checkRateLimit(`register:${ip}`, LIMITS.register);
  if (!rl.allowed) {
    const response = userError("Too many attempts, try again shortly", 429);
    Object.entries(rateLimitHeaders(rl.remaining, rl.resetAt)).forEach(([key, value]) => response.headers.set(key, String(value)));
    return response;
  }

  try {
    const parsed = registerSchema.safeParse(await req.json());
    if (!parsed.success) return userError(parsed.error.issues[0]?.message || "Please check your information", 400);
    const { name, email, password, phone } = parsed.data;
    const lowerEmail = email.toLowerCase().trim();
    if (await prisma.user.findUnique({ where: { email: lowerEmail } })) return userError("Email already registered. Sign in or resend your verification email.", 409);

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email: lowerEmail, password: hashed, phone: phone || null } });

    try {
      const token = await createEmailVerificationToken(user.id);
      await sendVerificationEmail({ to: user.email, name: user.name || "there", token });
    } catch (emailError) {
      const id = logError("register-email", emailError, { ip, userId: user.id });
      return NextResponse.json({ error: "Your account was created, but we could not send the verification email. Please use the resend option.", verificationRequired: true, email: user.email, requestId: id }, { status: 503, headers: { "X-Request-ID": id, "Cache-Control": "no-store" } });
    }

    return NextResponse.json({ id: user.id, email: user.email, verificationRequired: true });
  } catch (e) {
    const id = logError("register", e, { ip });
    return userError("Could not create account", 500, id);
  }
}
