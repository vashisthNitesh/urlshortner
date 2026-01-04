import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateLinkSchema } from "@/lib/validation";
import bcrypt from "bcryptjs";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const parsed = updateLinkSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const link = await prisma.link.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = parsed.data;
  const updated = await prisma.link.update({
    where: { id: link.id },
    data: {
      url: data.url ?? link.url,
      title: data.title ?? link.title,
      status: data.status ?? link.status,
      expiresAt: data.expiresAt ?? link.expiresAt,
      password: data.password ? await bcrypt.hash(data.password, 10) : link.password
    }
  });
  return NextResponse.json({ link: updated });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const existing = await prisma.link.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.link.delete({ where: { id: existing.id } });
  return NextResponse.json({ success: true });
}
