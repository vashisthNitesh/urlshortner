import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bulkSchema } from "@/lib/validation";
import crypto from "crypto";
import Papa from "papaparse";
import { planFeatures, RESERVED_SLUGS } from "@/lib/plans";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const plan = planFeatures[session.user.plan];
  const raw = await request.text();
  let linksPayload: any;
  try {
    linksPayload = JSON.parse(raw);
  } catch {
    const parsedCsv = Papa.parse(raw, { header: true });
    linksPayload = { links: parsedCsv.data };
  }
  const parsed = bulkSchema.safeParse(linksPayload);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  if (parsed.data.links.length > plan.bulkLimit) return NextResponse.json({ error: "Bulk limit exceeded" }, { status: 403 });

  const created = [];
  for (const item of parsed.data.links) {
    const slug = item.slug || crypto.randomUUID().slice(0, 8);
    if (RESERVED_SLUGS.has(slug)) continue;
    const exists = await prisma.link.findFirst({ where: { slug } });
    if (exists) continue;
    const link = await prisma.link.create({
      data: {
        slug,
        url: item.url,
        title: item.title,
        userId: session.user.id
      }
    });
    created.push(link);
  }
  return NextResponse.json({ created });
}
