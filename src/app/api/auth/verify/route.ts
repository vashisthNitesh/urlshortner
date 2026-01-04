import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/security";

export async function POST(request: Request) {
  const { token } = await request.json();
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });
  const hashed = hashToken(token);
  const record = await prisma.verificationToken.findFirst({
    where: { token: hashed, expires: { gt: new Date() } }
  });
  if (!record) return NextResponse.json({ error: "Invalid token" }, { status: 400 });

  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() }
  });
  await prisma.verificationToken.delete({ where: { identifier_token: { identifier: record.identifier, token: record.token } } });
  return NextResponse.json({ success: true });
}
