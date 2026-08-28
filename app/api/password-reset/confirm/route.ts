import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, LIMITS, rateLimitHeaders } from "@/lib/security/rateLimit";
import { passwordResetIdentifier } from "@/lib/email/password-reset";
import { logError } from "@/lib/security/error";

const schema = z.object({
  token: z.string().length(64),
  password: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(`password-reset-confirm:${ip}`, LIMITS.auth);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again shortly." }, { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) });
  }

  try {
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Use a valid reset link and a password of at least 8 characters." }, { status: 400 });

    const { token, password } = parsed.data;
    const reset = await prisma.verificationToken.findFirst({
      where: { token, expires: { gt: new Date() }, identifier: { startsWith: "password-reset:" } },
    });

    if (!reset) return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });

    const userId = reset.identifier.slice("password-reset:".length);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { password: hashed } }),
      prisma.verificationToken.deleteMany({ where: { identifier: passwordResetIdentifier(user.id) } }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const requestId = logError("password-reset-confirm", error, { ip });
    return NextResponse.json({ error: "Could not reset password", requestId }, { status: 500 });
  }
}
