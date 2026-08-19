import { Reveal } from "@/components/reveal";

const RANK_GLYPH: Record<string, string> = {
  gold: "GLD",
  silver: "SLV",
  bronze: "BRZ",
  encouragement: "ENC",
  special: "AWD",
};

export function CompetitionLedger({
  items,
}: {
  items: { id: string; name: string; rank: string; rankLabel: string; year: string; priorityLabel?: string }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
      {items.map((item, i) => (
        <Reveal key={item.id} delay={Math.min(i * 0.03, 0.24)}>
          <div
            data-physics
            className="flex items-center justify-between gap-4 border-b py-4"
            style={{ borderColor: "var(--line)", background: "var(--bg)" }}
          >
            <div className="flex items-center gap-4">
              <span
                className="font-mono text-[11px] tracking-[0.06em]"
                style={{ color: "var(--accent-signal)" }}
              >
                {RANK_GLYPH[item.rank] || "—"}
              </span>
              <h3 className="text-sm font-medium">{item.name}</h3>
            </div>
            <span className="shrink-0 font-mono text-xs" style={{ color: "var(--fg-3)" }}>
              {item.year}
            </span>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function ActivityLedger({
  items,
}: {
  items: { id: string; name: string; year: string; tags: string[] }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
      {items.map((item, i) => (
        <Reveal key={item.id} delay={Math.min(i * 0.03, 0.24)}>
          <div
            data-physics
            className="flex items-center justify-between gap-4 border-b py-4"
            style={{ borderColor: "var(--line)", background: "var(--bg)" }}
          >
            <div>
              <h3 className="text-sm font-medium">{item.name}</h3>
              {item.tags.length > 0 && (
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.05em]" style={{ color: "var(--accent-ai)" }}>
                  {item.tags.join(" · ")}
                </p>
              )}
            </div>
            <span className="shrink-0 font-mono text-xs" style={{ color: "var(--fg-3)" }}>
              {item.year}
            </span>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
