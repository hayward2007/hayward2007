import type { ReactNode } from "react";

export function HighlightCard({
  index,
  label,
  accent,
  children,
}: {
  index: number;
  label: string;
  accent: string;
  children: ReactNode;
}) {
  return (
    <article
      className="group relative grid min-h-[60px] grid-cols-[42px_minmax(0,1fr)] items-center gap-x-3 border-b px-2 py-3.5 transition-colors last:border-b-0 hover:[background:var(--bg-raised)] md:grid-cols-[48px_142px_minmax(0,1fr)] md:gap-x-5 md:px-4"
      style={{ borderColor: "var(--line)" }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-3 left-0 w-0.5 scale-y-0 transition-transform duration-200 group-hover:scale-y-100"
        style={{ background: accent }}
      />
      <span className="type-index text-base tabular-nums" style={{ color: accent }}>
        {String(index).padStart(2, "0")}
      </span>
      <span
        className="type-label hidden md:block"
        style={{ color: "var(--fg-3)" }}
      >
        {label}
      </span>
      <div className="min-w-0">
        <span className="type-label mb-1 block text-[10px] md:hidden" style={{ color: "var(--fg-3)" }}>
          {label}
        </span>
        <p className="type-card-title text-[15px] md:text-base" style={{ color: "var(--fg)" }}>
          {children}
        </p>
      </div>
    </article>
  );
}
