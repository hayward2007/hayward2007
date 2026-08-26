import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdminRequest } from "@/lib/admin-api";
import { activityPatchSchema } from "@/lib/admin-validation";
import { readJsonObject } from "@/lib/request-security";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await authorizeAdminRequest(request);
  if (denied) return denied;

  const { id } = await params;
  const bodyResult = await readJsonObject(request, 16_000);
  if (!bodyResult.ok) return bodyResult.response;
  const parsed = activityPatchSchema.safeParse(bodyResult.value);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const { tags, ...fields } = parsed.data;
  const data = { ...fields, ...(tags ? { tags: JSON.stringify(tags) } : {}) };

  try {
    const activity = await prisma.activity.update({ where: { id }, data });
    return NextResponse.json({ activity });
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 400 });
  }
}
