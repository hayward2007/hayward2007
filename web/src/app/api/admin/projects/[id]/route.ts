import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/notion";
import { authorizeAdminRequest } from "@/lib/admin-api";
import { projectPatchSchema } from "@/lib/admin-validation";
import { readJsonObject } from "@/lib/request-security";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await authorizeAdminRequest(request);
  if (denied) return denied;

  const { id } = await params;
  const bodyResult = await readJsonObject(request, 220_000);
  if (!bodyResult.ok) return bodyResult.response;
  const parsed = projectPatchSchema.safeParse(bodyResult.value);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const data = { ...parsed.data };

  if (data.slug) {
    const slug = slugify(data.slug);
    if (!slug) return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
    data.slug = slug;
  }

  try {
    const project = await prisma.project.update({ where: { id }, data });
    return NextResponse.json({ project });
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 400 });
  }
}
