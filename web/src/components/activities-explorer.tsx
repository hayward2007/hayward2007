"use client";

import { useMemo, useState } from "react";
import { ActivityLedger } from "@/components/ledger";
import { EntryDetailPanel, type DetailEntry } from "@/components/entry-detail-panel";

type Activity = { id: string; name: string; year: string; tags: string[]; aiSummary: string };

export function ActivitiesExplorer({
  activities,
  allLabel = "All",
  closeLabel = "Close",
  emptyLabel = "Nothing written up yet.",
}: {
  activities: Activity[];
  allLabel?: string;
  closeLabel?: string;
  emptyLabel?: string;
}) {
  const [filter, setFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<Activity | null>(null);

  const tags = useMemo(() => {
    const set = new Set<string>();
    activities.forEach((a) => a.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [activities]);

  const filtered = filter ? activities.filter((a) => a.tags.includes(filter)) : activities;

  const detailEntry: DetailEntry | null = selected
    ? { id: selected.id, name: selected.name, meta: selected.year, tags: selected.tags, aiSummary: selected.aiSummary }
    : null;

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
      <ActivityLedger items={filtered} onSelect={setSelected} />
      <EntryDetailPanel entry={detailEntry} onClose={() => setSelected(null)} closeLabel={closeLabel} emptyLabel={emptyLabel} />
    </div>
  );
}
