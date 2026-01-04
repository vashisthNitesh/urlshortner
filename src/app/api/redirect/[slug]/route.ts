import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordClick } from "@/lib/analytics";
import bcrypt from "bcryptjs";

async function findLink(slug: string, domain?: string | null) {
  if (domain) {
    const domainRecord = await prisma.domain.findUnique({ where: { hostname: domain } });
    return prisma.link.findFirst({ where: { slug, domainId: domainRecord?.id } });
  }
  return prisma.link.findFirst({ where: { slug, domainId: null } });
}

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const domain = request.nextUrl.searchParams.get("domain");
  const password = request.nextUrl.searchParams.get("password");
  const status = request.nextUrl.searchParams.get("status");
  const link = await findLink(params.slug, domain);
  if (!link || link.status === "paused") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (link.expiresAt && link.expiresAt < new Date()) {
    return NextResponse.json({ error: "Expired" }, { status: 410 });
  }
  if (link.password) {
    if (!password) return NextResponse.json({ error: "Password required" }, { status: 401 });
    const valid = await bcrypt.compare(password, link.password);
    if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (status === "preview") {
    return NextResponse.json({ url: link.url, safe: link.previewSafe });
  }
  recordClick({ linkId: link.id, request }).catch(() => null);
  const redirectType = request.nextUrl.searchParams.get("permanent") === "true" ? 301 : 302;
  return NextResponse.redirect(link.url, redirectType);
}

export { GET as runtimeGET };
