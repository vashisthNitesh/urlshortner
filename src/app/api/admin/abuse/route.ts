import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { abuseSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const parsed = abuseSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  await prisma.abuseReport.create({
    data: {
      linkId: parsed.data.linkId,
      reason: parsed.data.reason,
      userId: session.user.id
    }
  });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { linkId, action } = await request.json();
  if (action === "disable") {
    await prisma.link.update({ where: { id: linkId }, data: { status: "paused" } });
  }
  return NextResponse.json({ success: true });
}
