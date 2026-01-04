import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { hashToken } from "@/lib/security";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json();
  const email = body.email as string | undefined;
  const newPassword = body.password as string | undefined;
  const token = body.token as string | undefined;

  if (token && newPassword) {
    const record = await prisma.verificationToken.findFirst({
      where: { token: hashToken(token), identifier: email }
    });
    if (!record || record.expires < new Date()) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { email: email! }, data: { passwordHash } });
    await prisma.verificationToken.delete({ where: { identifier_token: { identifier: email!, token: record.token } } });
    return NextResponse.json({ success: true });
  }

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (!exists) return NextResponse.json({ success: true });
  const resetToken = crypto.randomUUID();
  await prisma.verificationToken.upsert({
    where: { identifier_token: { identifier: email, token: hashToken(resetToken) } },
    update: { expires: new Date(Date.now() + 1000 * 60 * 30) },
    create: { identifier: email, token: hashToken(resetToken), expires: new Date(Date.now() + 1000 * 60 * 30) }
  });
  await sendEmail(email, "Reset your password", `Reset token: ${resetToken}. Submit with new password to /api/auth/reset`);
  return NextResponse.json({ success: true });
}
