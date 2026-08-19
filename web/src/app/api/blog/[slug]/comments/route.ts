import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripHtml } from "@/lib/html";

const NAME_MAX = 60;
const BODY_MAX = 1000;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const comments = await prisma.comment.findMany({
    where: { postId: post.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ comments });
}

// Public, unauthenticated, and published immediately (the site owner's choice —
// no moderation queue). Still sanitized to plain text and length-capped, since
// "no moderation" only means no approval step, not no basic input hygiene.
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !post.published) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const name = stripHtml(typeof body.name === "string" ? body.name : "").slice(0, NAME_MAX);
  const text = stripHtml(typeof body.body === "string" ? body.body : "").slice(0, BODY_MAX);
  if (!name || !text) return NextResponse.json({ error: "name_and_body_required" }, { status: 400 });

  const comment = await prisma.comment.create({ data: { postId: post.id, name, body: text } });
  return NextResponse.json({ comment });
}
