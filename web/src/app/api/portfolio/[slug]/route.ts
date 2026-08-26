import { NextRequest } from "next/server";
import { getPortfolioBySlug } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIdentifier,
  isSafeSlug,
  isSameOriginRequest,
  noStoreJson,
} from "@/lib/request-security";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSafeSlug(slug)) return noStoreJson({ error: "not_found" }, { status: 404 });
  const portfolio = await getPortfolioBySlug(slug);
  if (!portfolio) return noStoreJson({ error: "not_found" }, { status: 404 });
  return noStoreJson({ portfolio });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSafeSlug(slug)) return noStoreJson({ error: "not_found" }, { status: 404 });
  if (!isSameOriginRequest(request)) {
    return noStoreJson({ error: "invalid_origin" }, { status: 403 });
  }

  const clientId = getClientIdentifier(request);
  const limit = checkRateLimit(`portfolio-view:${slug}:${clientId}`, 1, 60 * 60 * 1000);
  if (!limit.allowed) return noStoreJson({ ok: true }, { status: 202 });

  const portfolio = await prisma.portfolioBuild.findUnique({
    where: { slug },
    select: { id: true, isPublished: true },
  });
  if (!portfolio?.isPublished) return noStoreJson({ error: "not_found" }, { status: 404 });

  await prisma.portfolioBuild.update({
    where: { id: portfolio.id },
    data: { viewCount: { increment: 1 } },
  });
  return noStoreJson({ ok: true }, { status: 202 });
}
