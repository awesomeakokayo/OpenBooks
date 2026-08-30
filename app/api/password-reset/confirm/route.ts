import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, LIMITS, rateLimitHeaders } from "@/lib/security/rateLimit";
import { passwordResetIdentifier } from "@/lib/email/password-reset";
import { logError, userError } from "@/lib/security/error";

const schema = z.object({ token: z.string().length(64), password: z.string().min(8).max(100) });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = await checkRateLimit(`password-reset-confirm:${ip}`, LIMITS.passwordReset);
  if (!rl.allowed) {
    const response = userError("Too many attempts. Please try again shortly.", 429);
    Object.entries(rateLimitHeaders(rl.remaining, rl.resetAt)).forEach(([key, value]) => response.headers.set(key, String(value)));
    return response;
  }

  try {
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return userError("Use a valid reset link and a password of at least 8 characters.", 400);
    const { token, password } = parsed.data;
    const reset = await prisma.verificationToken.findFirst({ where: { token, expires: { gt: new Date() }, identifier: { startsWith: "password-reset:" } } });
    if (!reset) return userError("This reset link is invalid or has expired.", 400);
    const userId = reset.identifier.slice("password-reset:".length);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) return userError("This reset link is invalid or has expired.", 400);
    const hashed = await bcrypt.hash(password, 10);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { password: hashed } }),
      prisma.verificationToken.deleteMany({ where: { identifier: passwordResetIdentifier(user.id) } }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
    ]);
    return Response.json({ ok: true });
  } catch (error) {
    const id = logError("password-reset-confirm", error, { ip });
    return userError("Could not reset password", 500, id);
  }
}
