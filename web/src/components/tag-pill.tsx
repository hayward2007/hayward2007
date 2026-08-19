// Shared "box that only ever grows in width, never height" pill — used for
// project tags, record/activity tags, and blog tags so hover behavior reads
// as one consistent interactive language across the site instead of a
// per-page one-off. Default size is intentionally small; the full tag text
// reveals on hover via a max-width transition, so the pill's height (set
// purely by its fixed padding/line-height) never changes.
export function TagPill({ tag, className = "" }: { tag: string; className?: string }) {
  return (
    <span
      title={tag}
      className={`inline-block max-w-[4.5rem] shrink-0 overflow-hidden whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] transition-[max-width] duration-300 ease-out hover:max-w-[11rem] group-hover:max-w-[11rem] ${className}`}
      style={{ borderColor: "var(--line-strong)", color: "var(--fg-3)", background: "var(--bg-raised)" }}
    >
      {tag}
    </span>
  );
}
