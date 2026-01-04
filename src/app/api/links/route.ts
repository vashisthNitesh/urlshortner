import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { linkSchema } from "@/lib/validation";
import { planFeatures, RESERVED_SLUGS } from "@/lib/plans";
import { verifyRecaptcha, isRateLimited } from "@/lib/security";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const search = request.nextUrl.searchParams.get("q") || undefined;
  const links = await prisma.link.findMany({
    where: {
      userId: session.user.id,
      OR: search
        ? [
            { slug: { contains: search, mode: "insensitive" } },
            { title: { contains: search, mode: "insensitive" } },
            { url: { contains: search, mode: "insensitive" } }
          ]
        : undefined
    },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ links });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const plan = planFeatures[session.user.plan];
  const body = await request.json();
  const parsed = linkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;

  if (isRateLimited("links", session.user.id, plan.rateLimitPerMinute, 60_000)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const captcha = session.user.plan === "free" ? await verifyRecaptcha(body.recaptcha as string | undefined) : true;
  if (!captcha) return NextResponse.json({ error: "Captcha required" }, { status: 400 });
  if (!plan.passwordLinks && data.password) return NextResponse.json({ error: "Upgrade for password protection" }, { status: 403 });
  if (!plan.expiration && data.expiresAt) return NextResponse.json({ error: "Upgrade for expiration" }, { status: 403 });
  if (data.domain && !plan.customDomain) return NextResponse.json({ error: "Custom domains require premium" }, { status: 403 });

  if (RESERVED_SLUGS.has(data.slug)) return NextResponse.json({ error: "Slug reserved" }, { status: 400 });

  const monthStart = new Date();
  monthStart.setDate(1);
  const count = await prisma.link.count({ where: { userId: session.user.id, createdAt: { gte: monthStart } } });
  if (count >= plan.monthlyLinks) return NextResponse.json({ error: "Monthly limit reached" }, { status: 403 });

  let domainId: string | undefined;
  if (data.domain) {
    const domain = await prisma.domain.findFirst({ where: { hostname: data.domain, userId: session.user.id } });
    if (!domain) return NextResponse.json({ error: "Domain not found or not verified" }, { status: 400 });
    domainId = domain.id;
  }

  const existing = await prisma.link.findFirst({ where: { slug: data.slug, domainId } });
  if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });

  const link = await prisma.link.create({
    data: {
      slug: data.slug,
      url: data.url,
      title: data.title,
      domainId,
      password: data.password ? await bcrypt.hash(data.password, 10) : undefined,
      expiresAt: data.expiresAt,
      userId: session.user.id,
      utmSource: data.utm?.source,
      utmMedium: data.utm?.medium,
      utmCampaign: data.utm?.campaign,
      utmTerm: data.utm?.term,
      utmContent: data.utm?.content,
      status: data.status
    }
  });

  if (data.tags?.length) {
    for (const tagName of data.tags) {
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName }
      });
      await prisma.linkTag.create({ data: { linkId: link.id, tagId: tag.id } });
    }
  }

  return NextResponse.json({ link });
}
