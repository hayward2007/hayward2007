import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "crypto";

// Real values live only here, imported only by the two API routes below —
// never by the page or any client component — so they never ship in the
// server-rendered HTML or the client JS bundle. A crawler that just fetches
// /portfolio and greps the response finds nothing.
export const PROTECTED_CONTACT = {
  dob: "2007.02.21",
  phone: "010-4944-0221",
  email: "hayward2007@naver.com",
} as const;

// Generated fresh per server process rather than read from an env var — this
// isn't guarding a real secret, just signing a short-lived timestamp, so a
// restart invalidating outstanding tokens (client just re-requests one) is a
// fine trade for one less required production env var.
const SIGNING_KEY = randomBytes(32);

// A token younger than this was almost certainly generated and replayed by a
// script in one shot, not by someone actually dragging the slider — a real
// drag interaction takes noticeably longer. Older than this, require a fresh
// token so a captured one can't be reused indefinitely.
const MIN_TOKEN_AGE_MS = 600;
const MAX_TOKEN_AGE_MS = 3 * 60 * 1000;

function sign(payload: string): string {
  return createHmac("sha256", SIGNING_KEY).update(payload).digest("base64url");
}

export function issueChallengeToken(): string {
  const issuedAt = String(Date.now());
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function verifyChallengeToken(token: unknown): boolean {
  if (typeof token !== "string" || token.length > 200) return false;

  const [issuedAtRaw, providedSig] = token.split(".");
  if (!issuedAtRaw || !providedSig) return false;

  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) return false;

  const expected = Buffer.from(sign(issuedAtRaw));
  const provided = Buffer.from(providedSig);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return false;

  const age = Date.now() - issuedAt;
  return age >= MIN_TOKEN_AGE_MS && age <= MAX_TOKEN_AGE_MS;
}
