import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { domainSchema } from "@/lib/validation";
import { planFeatures } from "@/lib/plans";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const domains = await prisma.domain.findMany({ where: { userId: session.user.id } });
  return NextResponse.json({ domains });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const plan = planFeatures[session.user.plan];
  const body = await request.json();
  const parsed = domainSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  if (!plan.customDomain) return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
  const count = await prisma.domain.count({ where: { userId: session.user.id } });
  if (count >= plan.customDomains) return NextResponse.json({ error: "Domain limit reached" }, { status: 403 });

  const domain = await prisma.domain.create({
    data: { hostname: parsed.data.hostname, verified: parsed.data.verified ?? false, userId: session.user.id }
  });
  return NextResponse.json({ domain });
}
