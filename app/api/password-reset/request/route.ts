import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, LIMITS, rateLimitHeaders } from "@/lib/security/rateLimit";
import { createPasswordResetToken, sendPasswordResetEmail } from "@/lib/email/password-reset";
import { logError } from "@/lib/security/error";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });

  const email = parsed.data.email.toLowerCase().trim();
  const rl = checkRateLimit(`password-reset:${ip}:${email}`, LIMITS.auth);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Keep the response identical for unknown accounts and OAuth-only users.
    if (!user || !user.password) {
      return NextResponse.json({ ok: true, message: "If an account uses email/password, a reset link has been sent." });
    }

    const token = await createPasswordResetToken(user.id);
    await sendPasswordResetEmail({ to: user.email, name: user.name || "there", token });

    return NextResponse.json({ ok: true, message: "If an account uses email/password, a reset link has been sent." });
  } catch (error) {
    const requestId = logError("password-reset-request", error, { ip });
    return NextResponse.json({ error: "Could not send password reset email", requestId }, { status: 500 });
  }
}
