import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/notion";
import { authorizeAdminRequest } from "@/lib/admin-api";
import { blogCreateSchema } from "@/lib/admin-validation";
import { noStoreJson, readJsonObject } from "@/lib/request-security";

export async function GET(request: NextRequest) {
  const denied = await authorizeAdminRequest(request);
  if (denied) return denied;

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { comments: true } } },
  });
  return noStoreJson({ posts });
}

export async function POST(request: NextRequest) {
  const denied = await authorizeAdminRequest(request);
  if (denied) return denied;

  const bodyResult = await readJsonObject(request, 8_000);
  if (!bodyResult.ok) return bodyResult.response;
  const parsed = blogCreateSchema.safeParse(bodyResult.value);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const { title } = parsed.data;

  const base = slugify(title);
  let slug = base;
  let n = 1;
  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${base}-${++n}`;
  }

  const post = await prisma.blogPost.create({ data: { title, slug, body: "", published: false } });
  return noStoreJson({ post }, { status: 201 });
}
