"use client";

import { useEffect, useState } from "react";

type Activity = {
  id: string;
  name: string;
  year: string | null;
  visibility: string;
  tags: string;
};

function parseTags(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join(", ") : "";
  } catch {
    return "";
  }
}

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<Activity[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/activities")
      .then((r) => r.json())
      .then((data) => setActivities(data.activities));
  }, []);

  async function save(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/admin/activities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const data = await res.json();
      setActivities((prev) => prev?.map((a) => (a.id === id ? { ...a, ...data.activity } : a)) ?? prev);
    }
  }

  if (!activities) return <p style={{ color: "var(--fg-3)" }}>Loading…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Activities</h1>
      <div className="divide-y" style={{ borderColor: "var(--line)" }}>
        {activities.map((activity) => (
          <div key={activity.id} className="flex flex-wrap items-center gap-4 py-3">
            <div className="min-w-48 flex-1">
              <p className="font-medium">{activity.name}</p>
              <p className="text-xs" style={{ color: "var(--fg-3)" }}>
                {activity.year}
              </p>
            </div>
            <input
              defaultValue={parseTags(activity.tags)}
              placeholder="tags, comma separated"
              onBlur={(e) =>
                save(activity.id, { tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })
              }
              className="w-56 rounded-lg border px-3 py-1.5 text-sm"
              style={{ borderColor: "var(--line-strong)" }}
            />
            <select
              defaultValue={activity.visibility}
              onChange={(e) => save(activity.id, { visibility: e.target.value })}
              className="rounded-lg border px-3 py-1.5 text-sm"
              style={{ borderColor: "var(--line-strong)" }}
            >
              <option value="public">public</option>
              <option value="private">private</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
