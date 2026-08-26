import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripHtml } from "@/lib/html";
import {
  checkRateLimit,
  getClientIdentifier,
  isSafeSlug,
  isSameOriginRequest,
  noStoreJson,
  rateLimitResponse,
  readJsonObject,
} from "@/lib/request-security";

const NAME_MAX = 60;
const BODY_MAX = 1000;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSafeSlug(slug)) return noStoreJson({ error: "not_found" }, { status: 404 });
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !post.published) return noStoreJson({ error: "not_found" }, { status: 404 });

  const comments = await prisma.comment.findMany({
    where: { postId: post.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return noStoreJson({ comments: comments.reverse() });
}

// Public, unauthenticated, and published immediately (the site owner's choice —
// no moderation queue). Still sanitized to plain text and length-capped, since
// "no moderation" only means no approval step, not no basic input hygiene.
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSafeSlug(slug)) return noStoreJson({ error: "not_found" }, { status: 404 });
  if (!isSameOriginRequest(request)) {
    return noStoreJson({ error: "invalid_origin" }, { status: 403 });
  }

  const clientId = getClientIdentifier(request);
  const limit = checkRateLimit(`comment:${slug}:${clientId}`, 5, 10 * 60 * 1000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !post.published) return noStoreJson({ error: "not_found" }, { status: 404 });

  const bodyResult = await readJsonObject(request, 4_096);
  if (!bodyResult.ok) return bodyResult.response;
  const body = bodyResult.value as Record<string, unknown>;
  if (typeof body.website === "string" && body.website.trim()) {
    return noStoreJson({ ok: true }, { status: 202 });
  }
  const name = stripHtml(typeof body.name === "string" ? body.name : "").slice(0, NAME_MAX);
  const text = stripHtml(typeof body.body === "string" ? body.body : "").slice(0, BODY_MAX);
  if (!name || !text) return noStoreJson({ error: "name_and_body_required" }, { status: 400 });

  const comment = await prisma.comment.create({ data: { postId: post.id, name, body: text } });
  return noStoreJson({ comment }, { status: 201 });
}
