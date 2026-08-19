import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/notion";

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { comments: true } } },
  });
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "title_required" }, { status: 400 });

  const base = slugify(title);
  let slug = base;
  let n = 1;
  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${base}-${++n}`;
  }

  const post = await prisma.blogPost.create({ data: { title, slug, body: "", published: false } });
  return NextResponse.json({ post });
}
