import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncFromNotion, notionStatusHint, NotionApiError } from "@/lib/notion";

export async function POST() {
  const token = process.env.NOTION_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "notion_token_missing", message: "NOTION_ACCESS_TOKEN is not configured." },
      { status: 500 },
    );
  }

  try {
    const result = await syncFromNotion(token);
    await prisma.syncLog.create({
      data: { source: "notion", status: "success", message: JSON.stringify(result) },
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await prisma.syncLog.create({ data: { source: "notion", status: "error", message } });

    if (error instanceof NotionApiError) {
      return NextResponse.json(
        { error: "notion_api_error", notionStatus: error.status, hint: notionStatusHint(error.status) },
        { status: 502 },
      );
    }
    return NextResponse.json({ error: "sync_failed", message }, { status: 500 });
  }
}
