"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SearchEntry } from "@/lib/data";

const GROUPS: { type: SearchEntry["type"]; label: string; accent: string }[] = [
  { type: "project", label: "Projects", accent: "var(--accent-robotics)" },
  { type: "record", label: "Record", accent: "var(--accent-signal)" },
  { type: "activity", label: "Activities", accent: "var(--accent-signal)" },
  { type: "game", label: "Games", accent: "var(--accent-ai)" },
  { type: "tool", label: "Tools", accent: "var(--accent-ai)" },
  { type: "post", label: "Blog", accent: "var(--accent-signal)" },
];

export function SearchClient({ index }: { index: SearchEntry[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index;
    return index.filter((entry) => `${entry.title} ${entry.subtitle}`.toLowerCase().includes(q));
  }, [index, query]);

  const grouped = useMemo(() => {
    return GROUPS.map((group) => ({
      ...group,
      entries: filtered.filter((entry) => entry.type === group.type),
    })).filter((group) => group.entries.length > 0);
  }, [filtered]);

  return (
    <div>
      <input
        type="search"
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search projects, record, games, tools…"
        className="w-full rounded-xl border px-4 py-3 text-base"
        style={{ borderColor: "var(--line-strong)", background: "var(--bg-raised)" }}
      />

      <p className="mt-4 font-mono text-xs" style={{ color: "var(--fg-3)" }}>
        {filtered.length} {filtered.length === 1 ? "result" : "results"}
      </p>

      <div className="mt-8 space-y-10">
        {grouped.map((group) => (
          <div key={group.type}>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.1em]" style={{ color: group.accent }}>
              {group.label} <span style={{ color: "var(--fg-3)" }}>({group.entries.length})</span>
            </p>
            <div className="divide-y" style={{ borderColor: "var(--line)" }}>
              {group.entries.map((entry) => (
                <Link
                  key={`${entry.type}-${entry.title}-${entry.href}`}
                  href={entry.href}
                  data-cursor="true"
                  className="group flex items-center justify-between gap-4 border-t py-3 first:border-t-0"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{entry.title}</p>
                    {entry.subtitle && (
                      <p className="mt-0.5 truncate text-xs" style={{ color: "var(--fg-3)" }}>
                        {entry.subtitle}
                      </p>
                    )}
                  </div>
                  <span
                    className="shrink-0 font-mono text-xs opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ color: group.accent }}
                  >
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {grouped.length === 0 && (
          <p className="text-sm" style={{ color: "var(--fg-3)" }}>
            Nothing matches &ldquo;{query}&rdquo;.
          </p>
        )}
      </div>
    </div>
  );
}
