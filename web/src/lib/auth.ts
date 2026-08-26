import "server-only";

import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE_NAME = "hk_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h
const SESSION_ISSUER = "hayward.kim";
const SESSION_AUDIENCE = "hayward.kim-admin";

function getSecretKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set. Generate one with `openssl rand -hex 32`.");
  }
  if (new TextEncoder().encode(secret).byteLength < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 32 bytes.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
    });
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export const SESSION_COOKIE_MAX_AGE = SESSION_TTL_SECONDS;
