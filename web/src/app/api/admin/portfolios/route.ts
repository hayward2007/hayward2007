import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/notion";

export async function GET() {
  const portfolios = await prisma.portfolioBuild.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { project: true }, orderBy: { order: "asc" } } },
  });
  return NextResponse.json({ portfolios });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  if (!title) return NextResponse.json({ error: "missing_title" }, { status: 400 });

  const projectIds: string[] = Array.isArray(body.projectIds) ? body.projectIds : [];
  if (!projectIds.length) {
    return NextResponse.json({ error: "no_projects_selected" }, { status: 400 });
  }

  const baseSlug = slugify(body.slug || title);
  let slug = baseSlug;
  let n = 2;
  while (await prisma.portfolioBuild.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${n}`;
    n += 1;
  }

  const portfolio = await prisma.portfolioBuild.create({
    data: {
      slug,
      title,
      targetRole: body.targetRole || null,
      targetOrg: body.targetOrg || null,
      intro: body.intro || null,
      accent: body.accent || "teal",
      items: {
        create: projectIds.map((projectId, index) => ({
          projectId,
          order: index,
          highlightNote: body.highlightNotes?.[projectId] || null,
        })),
      },
    },
    include: { items: { include: { project: true } } },
  });

  return NextResponse.json({ portfolio }, { status: 201 });
}
