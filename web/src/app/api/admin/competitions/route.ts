import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const competitions = await prisma.competition.findMany({
    orderBy: [{ priority: "asc" }, { year: "desc" }],
  });
  return NextResponse.json({ competitions });
}
