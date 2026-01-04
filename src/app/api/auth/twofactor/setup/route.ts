import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authenticator } from "otplib";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.plan === "free") return NextResponse.json({ error: "Upgrade required" }, { status: 403 });

  const secret = authenticator.generateSecret();
  await prisma.user.update({ where: { id: session.user.id }, data: { twoFactorSecret: secret } });
  const otpauth = authenticator.keyuri(session.user.email!, "PulseLink", secret);
  return NextResponse.json({ secret, otpauth });
}
