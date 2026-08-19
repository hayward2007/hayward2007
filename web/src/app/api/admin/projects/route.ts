import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { order: "asc" },
    include: { awards: { include: { competition: true } } },
  });
  return NextResponse.json({ projects });
}
