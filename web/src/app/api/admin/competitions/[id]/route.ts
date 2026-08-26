import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdminRequest } from "@/lib/admin-api";
import { competitionPatchSchema } from "@/lib/admin-validation";
import { readJsonObject } from "@/lib/request-security";

const RANK_LABELS: Record<string, string> = {
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
  encouragement: "Encouragement",
  special: "Award",
  none: "Participated",
};

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await authorizeAdminRequest(request);
  if (denied) return denied;

  const { id } = await params;
  const bodyResult = await readJsonObject(request, 16_000);
  if (!bodyResult.ok) return bodyResult.response;
  const parsed = competitionPatchSchema.safeParse(bodyResult.value);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const data = {
    ...parsed.data,
    ...(parsed.data.rank ? { rankLabel: RANK_LABELS[parsed.data.rank] } : {}),
  };

  try {
    const competition = await prisma.competition.update({ where: { id }, data });
    return NextResponse.json({ competition });
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 400 });
  }
}
