export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;

  // next dev re-invokes register() on recompiles; guard so we never stack up
  // multiple setInterval loops in the same long-lived process.
  const g = globalThis as unknown as { __notionAutoSyncStarted?: boolean };
  if (g.__notionAutoSyncStarted) return;
  g.__notionAutoSyncStarted = true;

  const { startAutoSync } = await import("@/lib/auto-sync");
  await startAutoSync();
}
