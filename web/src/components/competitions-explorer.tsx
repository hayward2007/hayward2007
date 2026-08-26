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
      <div className="mb-8 inline-flex rounded-lg border p-1" style={{ borderColor: "var(--line)", background: "var(--bg-muted)" }}>
        <button
          type="button"
          onClick={() => setShowAll(false)}
          className="type-nav rounded-md px-3 py-1.5 text-[11px] transition-colors duration-150"
          style={{
            background: !showAll ? "var(--bg-raised)" : "transparent",
            color: !showAll ? "var(--fg)" : "var(--fg-3)",
            boxShadow: !showAll ? "var(--shadow-subtle)" : "none",
          }}
        >
          {placedOnlyLabel}
        </button>
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="type-nav rounded-md px-3 py-1.5 text-[11px] transition-colors duration-150"
          style={{
            background: showAll ? "var(--bg-raised)" : "transparent",
            color: showAll ? "var(--fg)" : "var(--fg-3)",
            boxShadow: showAll ? "var(--shadow-subtle)" : "none",
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
