import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/notion";
import { authorizeAdminRequest } from "@/lib/admin-api";
import { blogPatchSchema } from "@/lib/admin-validation";
import { readJsonObject } from "@/lib/request-security";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await authorizeAdminRequest(request, 300_000);
  if (denied) return denied;

  const { id } = await params;
  const bodyResult = await readJsonObject(request, 300_000);
  if (!bodyResult.ok) return bodyResult.response;
  const parsed = blogPatchSchema.safeParse(bodyResult.value);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const data = { ...parsed.data };

  if (data.slug) {
    const slug = slugify(data.slug);
    if (!slug) return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
    data.slug = slug;
  }

  try {
    const post = await prisma.blogPost.update({ where: { id }, data });
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await authorizeAdminRequest(_request);
  if (denied) return denied;

  const { id } = await params;
  try {
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "delete_failed" }, { status: 400 });
  }
}
