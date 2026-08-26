import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdminRequest } from "@/lib/admin-api";
import { portfolioPatchSchema } from "@/lib/admin-validation";
import { noStoreJson, readJsonObject } from "@/lib/request-security";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await authorizeAdminRequest(_request);
  if (denied) return denied;

  const { id } = await params;
  const portfolio = await prisma.portfolioBuild.findUnique({
    where: { id },
    include: { items: { include: { project: true }, orderBy: { order: "asc" } } },
  });
  if (!portfolio) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return noStoreJson({ portfolio });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await authorizeAdminRequest(request);
  if (denied) return denied;

  const { id } = await params;
  const bodyResult = await readJsonObject(request, 32_000);
  if (!bodyResult.ok) return bodyResult.response;
  const parsed = portfolioPatchSchema.safeParse(bodyResult.value);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const { projectIds, highlightNotes, ...data } = parsed.data;

  if (projectIds) {
    const projectCount = await prisma.project.count({ where: { id: { in: projectIds } } });
    if (projectCount !== projectIds.length) {
      return NextResponse.json({ error: "invalid_projects" }, { status: 400 });
    }
  }

  try {
    const portfolio = await prisma.$transaction(async (tx) => {
      await tx.portfolioBuild.update({ where: { id }, data });

      if (projectIds) {
        await tx.portfolioProject.deleteMany({ where: { portfolioId: id } });
        await tx.portfolioProject.createMany({
          data: projectIds.map((projectId, index) => ({
            portfolioId: id,
            projectId,
            order: index,
            highlightNote: highlightNotes?.[projectId] || null,
          })),
        });
      }

      return tx.portfolioBuild.findUnique({
        where: { id },
        include: { items: { include: { project: true }, orderBy: { order: "asc" } } },
      });
    });
    return noStoreJson({ portfolio });
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await authorizeAdminRequest(_request);
  if (denied) return denied;

  const { id } = await params;
  try {
    await prisma.portfolioBuild.delete({ where: { id } });
    return noStoreJson({ ok: true });
  } catch {
    return NextResponse.json({ error: "delete_failed" }, { status: 400 });
  }
}
