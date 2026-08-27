import { NextRequest } from "next/server";
import { checkRateLimit, getClientIdentifier, isSameOriginRequest, noStoreJson, rateLimitResponse } from "@/lib/request-security";
import { issueChallengeToken } from "@/lib/portfolio-contact";

export async function GET(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return noStoreJson({ error: "invalid_origin" }, { status: 403 });
  }

  const clientId = getClientIdentifier(request);
  const limit = checkRateLimit(`portfolio-contact-challenge:${clientId}`, 30, 10 * 60 * 1000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

  return noStoreJson({ token: issueChallengeToken() });
}
