import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";
import { hashToken, verifyRecaptcha, isRateLimited } from "@/lib/security";

export async function POST(request: Request) {
  const body = await request.json();
  if (isRateLimited("signup", request.headers.get("x-forwarded-for") || "ip", 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const recaptchaOk = await verifyRecaptcha(body.recaptcha as string | undefined);
  if (!recaptchaOk) {
    return NextResponse.json({ error: "Failed captcha" }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.json({ error: "User exists" }, { status: 400 });
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
      role: "free"
    }
  });

  const token = crypto.randomUUID();
  await prisma.verificationToken.create({
    data: {
      identifier: user.email,
      token: hashToken(token),
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
    }
  });

  await sendEmail(
    user.email,
    "Verify your PulseLink account",
    `Use this token to verify your email: ${token}. POST it to /api/auth/verify`
  );

  return NextResponse.json({ success: true });
}
