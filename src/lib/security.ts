import LRU from "lru-cache";
import { NextRequest } from "next/server";
import crypto from "crypto";

const rateLimiters = new Map<string, LRU<string, number>>();

export function getRateLimiter(bucket: string, max: number, ttlMs: number) {
  if (!rateLimiters.has(bucket)) {
    rateLimiters.set(
      bucket,
      new LRU<string, number>({
        max: 5000,
        ttl: ttlMs
      })
    );
  }
  return rateLimiters.get(bucket)!;
}

export function isRateLimited(bucket: string, key: string, max: number, ttlMs: number) {
  const limiter = getRateLimiter(bucket, max, ttlMs);
  const count = limiter.get(key) ?? 0;
  limiter.set(key, count + 1);
  return count >= max;
}

export async function verifyRecaptcha(token?: string) {
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    return true;
  }
  if (!token) return false;
  const params = new URLSearchParams();
  params.append("secret", process.env.RECAPTCHA_SECRET_KEY);
  params.append("response", token);
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: params
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch {
    return false;
  }
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.ip ||
    "unknown"
  );
}
