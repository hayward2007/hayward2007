import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/notion";

const EDITABLE_FIELDS = ["name", "slug", "descKo", "descEn", "cover", "icon", "visibility", "order"] as const;

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

  if (data.visibility && data.visibility !== "public" && data.visibility !== "private") {
    return NextResponse.json({ error: "invalid_visibility" }, { status: 400 });
  }

  try {
    const project = await prisma.project.update({ where: { id }, data });
    return NextResponse.json({ project });
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 400 });
  }
}
