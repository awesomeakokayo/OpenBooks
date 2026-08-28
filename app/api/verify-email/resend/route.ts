import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, LIMITS, rateLimitHeaders } from "@/lib/security/rateLimit";
import { createEmailVerificationToken, sendVerificationEmail } from "@/lib/email/verification";
import { logError } from "@/lib/security/error";

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const body = await req.json().catch(() => ({}));
  const parsed = resendSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const rl = checkRateLimit(`verify-resend:${ip}:${email}`, LIMITS.auth);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) },
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Return the same response for unknown or already-verified addresses so the
    // endpoint does not become a simple account-enumeration oracle.
    if (!user || user.emailVerified) {
      return NextResponse.json({ ok: true, message: "If that account needs verification, a new email has been sent." });
    }

    const token = await createEmailVerificationToken(user.id);
    await sendVerificationEmail({
      to: user.email,
      name: user.name || "there",
      token,
    });

    return NextResponse.json({ ok: true, message: "Verification email sent." });
  } catch (error) {
    const requestId = logError("verify-email-resend", error, { ip });
    return NextResponse.json({ error: "Could not resend verification email", requestId }, { status: 500 });
  }
}
