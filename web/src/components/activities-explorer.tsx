"use client";

import { useMemo, useState } from "react";
import { ActivityLedger } from "@/components/ledger";

type Activity = { id: string; name: string; year: string; tags: string[] };

export function ActivitiesExplorer({
  activities,
  allLabel = "All",
}: {
  activities: Activity[];
  allLabel?: string;
}) {
  const [filter, setFilter] = useState<string | null>(null);

  const tags = useMemo(() => {
    const set = new Set<string>();
    activities.forEach((a) => a.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [activities]);

  const filtered = filter ? activities.filter((a) => a.tags.includes(filter)) : activities;

  return (
    <div>
      {tags.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter(null)}
            className="rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.05em] transition-colors duration-150"
            style={{
              borderColor: "var(--line-strong)",
              background: filter === null ? "var(--fg)" : "transparent",
              color: filter === null ? "var(--bg)" : "var(--fg-3)",
            }}
          >
            {allLabel}
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setFilter(tag)}
              className="rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.05em] transition-colors duration-150"
              style={{
                borderColor: "var(--line-strong)",
                background: filter === tag ? "var(--fg)" : "transparent",
                color: filter === tag ? "var(--bg)" : "var(--fg-3)",
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      <ActivityLedger items={filtered} />
    </div>
  );
}
