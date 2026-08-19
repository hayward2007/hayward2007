import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const portfolio = await prisma.portfolioBuild.findUnique({
    where: { id },
    include: { items: { include: { project: true }, orderBy: { order: "asc" } } },
  });
  if (!portfolio) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ portfolio });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const data: Record<string, unknown> = {};
  for (const field of ["title", "targetRole", "targetOrg", "intro", "accent", "isPublished"] as const) {
    if (field in body) data[field] = body[field];
  }

  await prisma.portfolioBuild.update({ where: { id }, data });

  if (Array.isArray(body.projectIds)) {
    const projectIds: string[] = body.projectIds;
    await prisma.portfolioProject.deleteMany({ where: { portfolioId: id } });
    await prisma.portfolioProject.createMany({
      data: projectIds.map((projectId, index) => ({
        portfolioId: id,
        projectId,
        order: index,
        highlightNote: body.highlightNotes?.[projectId] || null,
      })),
    });
  }

  const portfolio = await prisma.portfolioBuild.findUnique({
    where: { id },
    include: { items: { include: { project: true }, orderBy: { order: "asc" } } },
  });
  return NextResponse.json({ portfolio });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.portfolioBuild.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
