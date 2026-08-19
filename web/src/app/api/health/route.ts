import { NextResponse } from "next/server";
import { getCounts, getLastSync } from "@/lib/data";

export async function GET() {
  const [counts, syncedAt] = await Promise.all([getCounts(), getLastSync()]);
  return NextResponse.json({
    ok: true,
    runtime: "nextjs",
    notionTokenConfigured: Boolean(process.env.NOTION_ACCESS_TOKEN),
    adminConfigured: Boolean(process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_SESSION_SECRET),
    counts,
    syncedAt,
  });
}
