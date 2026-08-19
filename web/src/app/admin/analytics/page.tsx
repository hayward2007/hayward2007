import { getAnalyticsSummary, type Bucket } from "@/lib/analytics";

export const dynamic = "force-dynamic";

function BarList({ title, buckets }: { title: string; buckets: Bucket[] }) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <div className="rounded-xl border p-5" style={{ borderColor: "var(--line)" }}>
      <p className="mb-4 text-sm font-medium">{title}</p>
      {buckets.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--fg-3)" }}>
          No data yet.
        </p>
      ) : (
        <div className="space-y-2.5">
          {buckets.map((b) => (
            <div key={b.label} className="flex items-center gap-3 text-sm">
              <span className="w-28 shrink-0 truncate" style={{ color: "var(--fg-2)" }}>
                {b.label}
              </span>
              <div className="relative h-5 flex-1 overflow-hidden rounded" style={{ background: "var(--bg-raised)" }}>
                <div
                  className="h-full rounded"
                  style={{ width: `${(b.count / max) * 100}%`, background: "var(--accent-robotics)" }}
                />
              </div>
              <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums" style={{ color: "var(--fg-3)" }}>
                {b.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const summary = await getAnalyticsSummary();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--fg-3)" }}>
          Logged client-side on every real page load. Append <code>?ref=name</code> to any link you share (LinkedIn,
          résumé, etc.) to see it broken out below.
        </p>
      </div>

      <div className="flex gap-10">
        <div>
          <p className="text-2xl font-semibold tabular-nums">{summary.total7d}</p>
          <p className="text-sm" style={{ color: "var(--fg-3)" }}>
            Views, last 7 days
          </p>
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums">{summary.total30d}</p>
          <p className="text-sm" style={{ color: "var(--fg-3)" }}>
            Views, last 30 days
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <BarList title="Top pages (30d)" buckets={summary.topPaths} />
        <BarList title="Referrers (30d)" buckets={summary.topReferrers} />
        <BarList title="Tracked links — ?ref= (30d)" buckets={summary.topRefs} />
      </div>
    </div>
  );
}
