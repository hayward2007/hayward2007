import { noStoreJson } from "@/lib/request-security";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return noStoreJson({ ok: true });
  } catch {
    return noStoreJson({ ok: false }, { status: 503 });
  }
}
