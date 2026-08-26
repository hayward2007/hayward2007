import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { ADMIN_COOKIE_NAME, SESSION_COOKIE_MAX_AGE, createSessionToken } from "@/lib/auth";
import {
  checkRateLimit,
  getClientIdentifier,
  isSameOriginRequest,
  noStoreJson,
  rateLimitResponse,
  readJsonObject,
} from "@/lib/request-security";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return noStoreJson({ error: "invalid_origin" }, { status: 403 });
  }

  const clientId = getClientIdentifier(request);
  const limit = checkRateLimit(`admin-login:${clientId}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    console.error("Admin sign-in is unavailable because ADMIN_PASSWORD_HASH is not configured.");
    return noStoreJson({ error: "service_unavailable" }, { status: 503 });
  }

  const bodyResult = await readJsonObject(request, 2_048);
  if (!bodyResult.ok) return bodyResult.response;
  const { password } = bodyResult.value as Record<string, unknown>;
  if (typeof password !== "string" || !password) {
    return noStoreJson({ error: "missing_password" }, { status: 400 });
  }

  const valid = await bcrypt.compare(password.slice(0, 256), hash);
  if (!valid) {
    return noStoreJson({ error: "invalid_credentials" }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = noStoreJson({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
    priority: "high",
  });
  return response;
}
