import { getCounts, getLastSync } from "@/lib/data";
import { AdminSyncButton } from "@/components/admin-sync-button";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [counts, syncedAt] = await Promise.all([getCounts(), getLastSync()]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--fg-3)" }}>
          {syncedAt ? `Last synced ${new Date(syncedAt).toLocaleString()}` : "Never synced from Notion yet."}
        </p>
      </div>

      <AdminSyncButton />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Projects", value: counts.projects, sub: `${counts.visibleProjects} public` },
          { label: "Competitions", value: counts.competitions },
          { label: "Activities", value: counts.activities, sub: `${counts.visibleActivities} public` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border p-5" style={{ borderColor: "var(--line)" }}>
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="text-sm" style={{ color: "var(--fg-3)" }}>
              {stat.label}
            </p>
            {stat.sub && (
              <p className="mt-1 text-xs" style={{ color: "var(--fg-4)" }}>
                {stat.sub}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
