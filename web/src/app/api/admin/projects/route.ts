import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdminRequest } from "@/lib/admin-api";
import { noStoreJson } from "@/lib/request-security";

export async function GET(request: NextRequest) {
  const denied = await authorizeAdminRequest(request);
  if (denied) return denied;

  const projects = await prisma.project.findMany({
    orderBy: { order: "asc" },
    include: { awards: { include: { competition: true } } },
  });
  return noStoreJson({ projects });
}
