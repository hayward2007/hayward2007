import { prisma } from "@/lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

export type Bucket = { label: string; count: number };

function toBuckets(rows: { label: string | null; count: number }[], limit = 8): Bucket[] {
  return rows
    .map((r) => ({ label: r.label || "(direct)", count: r.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getAnalyticsSummary() {
  const now = Date.now();
  const since7d = new Date(now - 7 * DAY_MS);
  const since30d = new Date(now - 30 * DAY_MS);

  const [total7d, total30d, byPath, byReferrer, byRef] = await Promise.all([
    prisma.pageView.count({ where: { createdAt: { gte: since7d } } }),
    prisma.pageView.count({ where: { createdAt: { gte: since30d } } }),
    prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: since30d } },
      _count: { path: true },
    }),
    prisma.pageView.groupBy({
      by: ["referrerHost"],
      where: { createdAt: { gte: since30d } },
      // _count: { referrerHost: true } is a SQL COUNT(referrerHost), which only
      // counts non-null values — so the null/"(direct)" group (rows where
      // referrerHost IS NULL, grouped by that same null value) always came out
      // 0 regardless of how much direct traffic there actually was. _count._all
      // counts rows (COUNT(*)) instead, which is what every group here needs.
      _count: { _all: true },
    }),
    prisma.pageView.groupBy({
      by: ["ref"],
      where: { createdAt: { gte: since30d }, ref: { not: null } },
      _count: { ref: true },
    }),
  ]);

  return {
    total7d,
    total30d,
    topPaths: toBuckets(byPath.map((r) => ({ label: r.path, count: r._count.path }))),
    topReferrers: toBuckets(byReferrer.map((r) => ({ label: r.referrerHost, count: r._count._all }))),
    topRefs: toBuckets(byRef.map((r) => ({ label: r.ref, count: r._count.ref }))),
  };
}
