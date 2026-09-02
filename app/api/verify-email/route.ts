import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, LIMITS } from "@/lib/security/rateLimit";
import { logError } from "@/lib/security/error";
import { appBaseUrl } from "@/lib/email/verification";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = await checkRateLimit(`verify-email:${ip}`, LIMITS.verifyEmail);
  const baseUrl = appBaseUrl();

  if (!rl.allowed) return NextResponse.redirect(new URL(`/verify-email?status=rate-limited`, baseUrl));

  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL(`/verify-email?status=invalid`, baseUrl));

  try {
    const verification = await prisma.verificationToken.findFirst({ where: { token, expires: { gt: new Date() } } });
    if (!verification) return NextResponse.redirect(new URL(`/verify-email?status=invalid`, baseUrl));

    await prisma.$transaction([
      prisma.user.update({ where: { id: verification.identifier }, data: { emailVerified: new Date() } }),
      prisma.verificationToken.deleteMany({ where: { identifier: verification.identifier } }),
    ]);
    return NextResponse.redirect(new URL(`/verify-email?status=success`, baseUrl));
  } catch (error) {
    const requestId = logError("verify-email", error, { ip, tokenPrefix: token.slice(0, 8) });
    return NextResponse.redirect(new URL(`/verify-email?status=error&requestId=${encodeURIComponent(requestId)}`, baseUrl));
  }
}
