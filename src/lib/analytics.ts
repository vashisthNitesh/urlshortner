import UAParser from "ua-parser-js";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";
import { hashToken } from "./security";

export async function recordClick({
  linkId,
  request,
  country
}: {
  linkId: string;
  request: NextRequest;
  country?: string;
}) {
  const ua = new UAParser(request.headers.get("user-agent") || "");
  const isBot = (request.headers.get("user-agent") || "").toLowerCase().includes("bot");
  if (isBot) return;
  const referrer = request.headers.get("referer") || undefined;
  await prisma.clickEvent.create({
    data: {
      linkId,
      referrer,
      device: ua.getDevice().type || "desktop",
      browser: ua.getBrowser().name || "unknown",
      os: ua.getOS().name || "unknown",
      country: country || request.headers.get("x-geo-country") || "unknown",
      region: request.headers.get("x-geo-region") || undefined,
      ipHash: hashToken(request.ip || "unknown"),
      occurredAt: new Date()
    }
  });
}
