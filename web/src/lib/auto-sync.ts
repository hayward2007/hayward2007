import { prisma } from "@/lib/prisma";
import { syncFromNotion } from "@/lib/notion";

const SYNC_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

async function syncOnce() {
  const token = process.env.NOTION_ACCESS_TOKEN;
  if (!token) return;

  try {
    const result = await syncFromNotion(token);
    await prisma.syncLog.create({
      data: { source: "notion", status: "success", message: JSON.stringify({ ...result, trigger: "auto" }) },
    });
    console.log("[auto-sync] synced from Notion:", result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.syncLog.create({ data: { source: "notion", status: "error", message } }).catch(() => {});
    console.error("[auto-sync] Notion sync failed:", message);
  }
}

/** Runs once at server boot, then keeps re-syncing on an interval for as long as the process lives. */
export async function startAutoSync() {
  if (!process.env.NOTION_ACCESS_TOKEN) {
    console.log("[auto-sync] NOTION_ACCESS_TOKEN not set — automatic Notion sync is disabled.");
    return;
  }
  await syncOnce();
  setInterval(syncOnce, SYNC_INTERVAL_MS);
}
