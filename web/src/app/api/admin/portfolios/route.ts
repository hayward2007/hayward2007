import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/notion";
import { authorizeAdminRequest } from "@/lib/admin-api";
import { portfolioCreateSchema } from "@/lib/admin-validation";
import { noStoreJson, readJsonObject } from "@/lib/request-security";

export async function GET(request: NextRequest) {
  const denied = await authorizeAdminRequest(request);
  if (denied) return denied;

  const portfolios = await prisma.portfolioBuild.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { project: true }, orderBy: { order: "asc" } } },
  });
  return noStoreJson({ portfolios });
}

export async function POST(request: NextRequest) {
  const denied = await authorizeAdminRequest(request);
  if (denied) return denied;

  const bodyResult = await readJsonObject(request, 32_000);
  if (!bodyResult.ok) return bodyResult.response;
  const parsed = portfolioCreateSchema.safeParse(bodyResult.value);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const { title, projectIds, highlightNotes, ...fields } = parsed.data;

  const projectCount = await prisma.project.count({ where: { id: { in: projectIds } } });
  if (projectCount !== projectIds.length) {
    return NextResponse.json({ error: "invalid_projects" }, { status: 400 });
  }

  const baseSlug = slugify(fields.slug || title);
  if (!baseSlug) return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
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
      targetRole: fields.targetRole || null,
      targetOrg: fields.targetOrg || null,
      intro: fields.intro || null,
      accent: fields.accent || "teal",
      isPublished: fields.isPublished ?? true,
      items: {
        create: projectIds.map((projectId, index) => ({
          projectId,
          order: index,
          highlightNote: highlightNotes?.[projectId] || null,
        })),
      },
    },
    include: { items: { include: { project: true } } },
  });

  return noStoreJson({ portfolio }, { status: 201 });
}
