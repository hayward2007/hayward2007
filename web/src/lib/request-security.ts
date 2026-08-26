import "server-only";

import { NextRequest, NextResponse } from "next/server";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const globalSecurity = globalThis as typeof globalThis & {
  __hkRateLimits?: Map<string, RateLimitEntry>;
};

const rateLimits = globalSecurity.__hkRateLimits ?? new Map<string, RateLimitEntry>();
globalSecurity.__hkRateLimits = rateLimits;

function pruneRateLimits(now: number) {
  if (rateLimits.size <= 5000) return;
  for (const [storedKey, entry] of rateLimits) {
    if (entry.resetAt <= now) rateLimits.delete(storedKey);
  }
  while (rateLimits.size > 5000) {
    const oldestKey = rateLimits.keys().next().value;
    if (typeof oldestKey !== "string") break;
    rateLimits.delete(oldestKey);
  }
}

export function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    forwarded ||
    "unknown"
  ).slice(0, 80);
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = rateLimits.get(key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs;
    rateLimits.set(key, { count: 1, resetAt });
    pruneRateLimits(now);
    return { allowed: true, retryAfter: Math.ceil(windowMs / 1000) };
  }

  current.count += 1;
  pruneRateLimits(now);

  return {
    allowed: current.count <= limit,
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

export function rateLimitResponse(retryAfter: number) {
  return NextResponse.json(
    { error: "too_many_requests" },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(retryAfter),
      },
    },
  );
}

export function isSameOriginRequest(request: NextRequest): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;

  const origin = request.headers.get("origin");
  if (!origin) return fetchSite === "same-origin" || fetchSite === "same-site";

  try {
    const originHost = new URL(origin).host.toLowerCase();
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const requestHost = (forwardedHost || request.headers.get("host") || "").toLowerCase();
    return Boolean(requestHost) && originHost === requestHost;
  } catch {
    return false;
  }
}

export function exceedsBodyLimit(request: NextRequest, maxBytes: number): boolean {
  const rawLength = request.headers.get("content-length");
  if (!rawLength) return false;
  const length = Number(rawLength);
  return Number.isFinite(length) && length > maxBytes;
}

export async function readJsonObject(request: NextRequest, maxBytes: number) {
  if (exceedsBodyLimit(request, maxBytes)) {
    return { ok: false as const, response: NextResponse.json({ error: "payload_too_large" }, { status: 413 }) };
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return { ok: false as const, response: NextResponse.json({ error: "json_required" }, { status: 415 }) };
  }

  const reader = request.body?.getReader();
  const decoder = new TextDecoder();
  let raw = "";
  let receivedBytes = 0;

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      receivedBytes += value.byteLength;
      if (receivedBytes > maxBytes) {
        await reader.cancel();
        return { ok: false as const, response: NextResponse.json({ error: "payload_too_large" }, { status: 413 }) };
      }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
  }

  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid_json_object");
    return { ok: true as const, value };
  } catch {
    return { ok: false as const, response: NextResponse.json({ error: "invalid_json" }, { status: 400 }) };
  }
}

export function noStoreJson(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(body, { ...init, headers });
}

export function isSafeSlug(value: string): boolean {
  return value.length <= 160 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}
