import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authenticator } from "otplib";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { token } = await request.json();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.twoFactorSecret) return NextResponse.json({ error: "Setup required" }, { status: 400 });
  const valid = authenticator.check(token, user.twoFactorSecret);
  if (!valid) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });
  return NextResponse.json({ success: true });
}
