import { Reveal } from "@/components/reveal";

const RANK_GLYPH: Record<string, string> = {
  gold: "GLD",
  silver: "SLV",
  bronze: "BRZ",
  encouragement: "ENC",
  special: "AWD",
};

type CompetitionItem = { id: string; name: string; rank: string; rankLabel: string; year: string; priorityLabel?: string };

// Generic so callers (CompetitionsExplorer) can pass their own richer item
// type straight through to onSelect without a lossy re-narrowing here.
export function CompetitionLedger<T extends CompetitionItem>({
  items,
  onSelect,
}: {
  items: T[];
  onSelect?: (item: T) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
      {items.map((item, i) => (
        <Reveal key={item.id} delay={Math.min(i * 0.03, 0.24)}>
          <button
            type="button"
            data-physics
            data-cursor={onSelect ? "View details" : undefined}
            onClick={() => onSelect?.(item)}
            disabled={!onSelect}
            className="group flex w-full items-center justify-between gap-4 border-b py-4 text-left transition-colors duration-150 disabled:cursor-default"
            style={{ borderColor: "var(--line)", background: "var(--bg)" }}
          >
            <div className="flex items-center gap-4">
              <span
                className="font-mono text-[11px] tracking-[0.06em]"
                style={{ color: "var(--accent-signal)" }}
              >
                {RANK_GLYPH[item.rank] || "—"}
              </span>
              <h3
                className="text-sm font-medium transition-colors duration-150"
                style={{ color: onSelect ? undefined : "var(--fg)" }}
              >
                <span className={onSelect ? "group-hover:text-[var(--accent-signal)]" : ""}>{item.name}</span>
              </h3>
            </div>
            <span className="shrink-0 font-mono text-xs" style={{ color: "var(--fg-3)" }}>
              {item.year}
            </span>
          </button>
        </Reveal>
      ))}
    </div>
  );
}

type ActivityItem = { id: string; name: string; year: string; tags: string[] };

export function ActivityLedger<T extends ActivityItem>({
  items,
  onSelect,
}: {
  items: T[];
  onSelect?: (item: T) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
      {items.map((item, i) => (
        <Reveal key={item.id} delay={Math.min(i * 0.03, 0.24)}>
          <button
            type="button"
            data-physics
            data-cursor={onSelect ? "View details" : undefined}
            onClick={() => onSelect?.(item)}
            disabled={!onSelect}
            className="group flex w-full items-center justify-between gap-4 border-b py-4 text-left transition-colors duration-150 disabled:cursor-default"
            style={{ borderColor: "var(--line)", background: "var(--bg)" }}
          >
            <div>
              <h3 className="text-sm font-medium">
                <span className={onSelect ? "group-hover:text-[var(--accent-ai)]" : ""}>{item.name}</span>
              </h3>
              {item.tags.length > 0 && (
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.05em]" style={{ color: "var(--accent-ai)" }}>
                  {item.tags.join(" · ")}
                </p>
              )}
            </div>
            <span className="shrink-0 font-mono text-xs" style={{ color: "var(--fg-3)" }}>
              {item.year}
            </span>
          </button>
        </Reveal>
      ))}
    </div>
  );
}
