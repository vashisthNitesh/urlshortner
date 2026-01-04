import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function POST(request: Request) {
  const { url } = await request.json();
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });
  const svg = await QRCode.toString(url, { type: "svg", margin: 1 });
  return NextResponse.json({ svg });
}
