import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/notion";

const EDITABLE_FIELDS = ["title", "slug", "body", "published"] as const;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const data: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) data[field] = body[field];
  }

  if (typeof data.slug === "string") {
    data.slug = slugify(data.slug) || undefined;
    if (!data.slug) delete data.slug;
  }

  try {
    const post = await prisma.blogPost.update({ where: { id }, data });
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "delete_failed" }, { status: 400 });
  }
}
