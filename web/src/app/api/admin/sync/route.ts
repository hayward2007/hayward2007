import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncFromNotion, notionStatusHint, NotionApiError } from "@/lib/notion";
import { authorizeAdminRequest } from "@/lib/admin-api";
import { noStoreJson } from "@/lib/request-security";

export async function POST(request: NextRequest) {
  const denied = await authorizeAdminRequest(request);
  if (denied) return denied;

  const token = process.env.NOTION_ACCESS_TOKEN;
  if (!token) {
    return noStoreJson({ error: "notion_unavailable" }, { status: 503 });
  }

  try {
    const result = await syncFromNotion(token);
    await prisma.syncLog.create({
      data: { source: "notion", status: "success", message: JSON.stringify(result) },
    });
    return noStoreJson({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await prisma.syncLog.create({ data: { source: "notion", status: "error", message: message.slice(0, 1000) } });

    if (error instanceof NotionApiError) {
      return noStoreJson(
        { error: "notion_api_error", notionStatus: error.status, hint: notionStatusHint(error.status) },
        { status: 502 },
      );
    }
    return noStoreJson({ error: "sync_failed" }, { status: 500 });
  }
}
