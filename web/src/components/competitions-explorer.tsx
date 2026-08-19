"use client";

import { useMemo, useState } from "react";
import { CompetitionLedger } from "@/components/ledger";
import { EntryDetailPanel, type DetailEntry } from "@/components/entry-detail-panel";

type Competition = {
  id: string;
  name: string;
  rank: string;
  rankLabel: string;
  year: string;
  isAward: boolean;
  aiSummary: string;
};

export function CompetitionsExplorer({
  competitions,
  placedOnlyLabel = "Placed only",
  viewAllLabel = "View all",
  closeLabel = "Close",
  emptyLabel = "Nothing written up yet.",
}: {
  competitions: Competition[];
  placedOnlyLabel?: string;
  viewAllLabel?: string;
  closeLabel?: string;
  emptyLabel?: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<Competition | null>(null);

  const filtered = useMemo(
    () => (showAll ? competitions : competitions.filter((c) => c.isAward)),
    [competitions, showAll],
  );

  const detailEntry: DetailEntry | null = selected
    ? {
        id: selected.id,
        name: selected.name,
        meta: [selected.year, selected.rankLabel].filter(Boolean).join(" · "),
        aiSummary: selected.aiSummary,
      }
    : null;

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowAll(false)}
          className="rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.05em] transition-colors duration-150"
          style={{
            borderColor: "var(--line-strong)",
            background: !showAll ? "var(--fg)" : "transparent",
            color: !showAll ? "var(--bg)" : "var(--fg-3)",
          }}
        >
          {placedOnlyLabel}
        </button>
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.05em] transition-colors duration-150"
          style={{
            borderColor: "var(--line-strong)",
            background: showAll ? "var(--fg)" : "transparent",
            color: showAll ? "var(--bg)" : "var(--fg-3)",
          }}
        >
          {viewAllLabel}
        </button>
      </div>
      <CompetitionLedger items={filtered} onSelect={setSelected} />
      <EntryDetailPanel entry={detailEntry} onClose={() => setSelected(null)} closeLabel={closeLabel} emptyLabel={emptyLabel} />
    </div>
  );
}
