import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function hostnameOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const path = typeof body.path === "string" ? body.path.slice(0, 512) : "/";

  // `document.referrer` (sent by the beacon, not the request's own same-origin
  // `Referer` header — that would just be the page the fetch was issued from)
  // is the actual external page the visitor arrived from, e.g. linkedin.com.
  const referrerHost = hostnameOf(typeof body.referrer === "string" ? body.referrer : null);

  await prisma.pageView.create({
    data: {
      path,
      ref: typeof body.ref === "string" ? body.ref.slice(0, 128) : null,
      utmSource: typeof body.utmSource === "string" ? body.utmSource.slice(0, 128) : null,
      utmMedium: typeof body.utmMedium === "string" ? body.utmMedium.slice(0, 128) : null,
      utmCampaign: typeof body.utmCampaign === "string" ? body.utmCampaign.slice(0, 128) : null,
      referrerHost: referrerHost && referrerHost !== request.nextUrl.hostname ? referrerHost : null,
      userAgent: (request.headers.get("user-agent") || "").slice(0, 256),
    },
  });

  return NextResponse.json({ ok: true });
}
