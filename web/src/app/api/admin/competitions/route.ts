import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdminRequest } from "@/lib/admin-api";
import { noStoreJson } from "@/lib/request-security";

export async function GET(request: NextRequest) {
  const denied = await authorizeAdminRequest(request);
  if (denied) return denied;

  const competitions = await prisma.competition.findMany({
    orderBy: [{ priority: "asc" }, { year: "desc" }],
  });
  return noStoreJson({ competitions });
}
