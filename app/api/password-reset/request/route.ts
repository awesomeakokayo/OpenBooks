import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, LIMITS, rateLimitHeaders } from "@/lib/security/rateLimit";
import { createPasswordResetToken, sendPasswordResetEmail } from "@/lib/email/password-reset";
import { logError, userError } from "@/lib/security/error";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return userError("Enter a valid email address", 400);

  const email = parsed.data.email.toLowerCase().trim();
  const rl = await checkRateLimit(`password-reset:${ip}:${email}`, LIMITS.passwordReset);
  if (!rl.allowed) {
    const response = userError("Too many requests. Please try again shortly.", 429);
    Object.entries(rateLimitHeaders(rl.remaining, rl.resetAt)).forEach(([key, value]) => response.headers.set(key, String(value)));
    return response;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    const message = "If an account uses email/password, a reset link has been sent.";
    if (!user || !user.password || !user.email) return NextResponse.json({ ok: true, message });
    const token = await createPasswordResetToken(user.id);
    await sendPasswordResetEmail({ to: user.email, name: user.name || "there", token });
    return NextResponse.json({ ok: true, message });
  } catch (error) {
    const id = logError("password-reset-request", error, { ip });
    return userError("Could not send password reset email", 500, id);
  }
}
