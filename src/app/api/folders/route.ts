import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const folders = await prisma.folder.findMany({ where: { userId: session.user.id } });
  return NextResponse.json({ folders });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await request.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const folder = await prisma.folder.create({ data: { name, userId: session.user.id } });
  return NextResponse.json({ folder });
}
