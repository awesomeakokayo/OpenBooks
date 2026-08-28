import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { checkRateLimit, LIMITS, rateLimitHeaders } from "@/lib/security/rateLimit";
import { logError } from "@/lib/security/error";
import { createEmailVerificationToken, sendVerificationEmail } from "@/lib/email/verification";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(`register:${ip}`, LIMITS.auth);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many attempts, try again shortly" }, { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) });
  }

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { name, email, password, phone } = parsed.data;
    const lowerEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: lowerEmail } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email: lowerEmail, password: hashed, phone: phone || null },
    });

    try {
      const token = await createEmailVerificationToken(user.id);
      await sendVerificationEmail({ to: user.email, name: user.name || "there", token });
    } catch (emailError) {
      await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined);
      throw emailError;
    }

    return NextResponse.json({ id: user.id, email: user.email, verificationRequired: true }, { status: 201 });
  } catch (e) {
    const id = logError("register", e, { ip: req.headers.get("x-forwarded-for") });
    return NextResponse.json({ error: "Could not create account", requestId: id }, { status: 500 });
  }
}
