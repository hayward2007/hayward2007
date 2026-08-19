import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const RANK_LABELS: Record<string, string> = {
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
  encouragement: "Encouragement",
  special: "Award",
  none: "Participated",
};

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const data: Record<string, unknown> = {};
  if ("name" in body) data.name = body.name;
  if ("year" in body) data.year = body.year;
  if ("priority" in body) data.priority = Number(body.priority) || 99;
  if ("rank" in body && RANK_LABELS[body.rank]) {
    data.rank = body.rank;
    data.rankLabel = RANK_LABELS[body.rank];
  }

  try {
    const competition = await prisma.competition.update({ where: { id }, data });
    return NextResponse.json({ competition });
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 400 });
  }
}
