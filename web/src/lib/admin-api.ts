import "server-only";

import { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { exceedsBodyLimit, isSameOriginRequest, noStoreJson } from "@/lib/request-security";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export async function authorizeAdminRequest(request: NextRequest, maxBodyBytes = 256_000) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!(await verifySessionToken(token))) {
    return noStoreJson({ error: "unauthorized" }, { status: 401 });
  }

  if (!SAFE_METHODS.has(request.method) && !isSameOriginRequest(request)) {
    return noStoreJson({ error: "invalid_origin" }, { status: 403 });
  }

  if (exceedsBodyLimit(request, maxBodyBytes)) {
    return noStoreJson({ error: "payload_too_large" }, { status: 413 });
  }

  return null;
}
