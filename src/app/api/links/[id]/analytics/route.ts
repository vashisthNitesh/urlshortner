import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const link = await prisma.link.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const events = await prisma.clickEvent.findMany({ where: { linkId: link.id } });
  const aggregate = {
    total: events.length,
    byCountry: countBy(events.map((e) => e.country || "unknown")),
    byReferrer: countBy(events.map((e) => e.referrer || "direct")),
    byDevice: countBy(events.map((e) => e.device || "unknown"))
  };
  return NextResponse.json({ aggregate, events });
}

function countBy(list: string[]) {
  return list.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}
