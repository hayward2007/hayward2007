import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const data: Record<string, unknown> = {};
  if ("name" in body) data.name = body.name;
  if ("year" in body) data.year = body.year;
  if ("visibility" in body) data.visibility = body.visibility;
  if ("tags" in body && Array.isArray(body.tags)) data.tags = JSON.stringify(body.tags);

  if (data.visibility && data.visibility !== "public" && data.visibility !== "private") {
    return NextResponse.json({ error: "invalid_visibility" }, { status: 400 });
  }

  try {
    const activity = await prisma.activity.update({ where: { id }, data });
    return NextResponse.json({ activity });
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 400 });
  }
}
