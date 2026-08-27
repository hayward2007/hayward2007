import { NextRequest } from "next/server";
import { checkRateLimit, getClientIdentifier, isSameOriginRequest, noStoreJson, rateLimitResponse, readJsonObject } from "@/lib/request-security";
import { PROTECTED_CONTACT, verifyChallengeToken } from "@/lib/portfolio-contact";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return noStoreJson({ error: "invalid_origin" }, { status: 403 });
  }

  const clientId = getClientIdentifier(request);
  const limit = checkRateLimit(`portfolio-contact-reveal:${clientId}`, 15, 10 * 60 * 1000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

  const bodyResult = await readJsonObject(request, 512);
  if (!bodyResult.ok) return bodyResult.response;
  const body = bodyResult.value as Record<string, unknown>;

  if (!verifyChallengeToken(body.token)) {
    return noStoreJson({ error: "verification_failed" }, { status: 403 });
  }

  return noStoreJson(PROTECTED_CONTACT);
}
