"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { TagPill } from "@/components/tag-pill";

export type DetailEntry = {
  id: string;
  name: string;
  meta: string;
  tags?: string[];
  aiSummary: string; // sanitized HTML, may be empty
};

// Shared click-to-open write-up panel for Record (competitions) and Activities
// rows — same fixed-overlay + backdrop-blur + Escape/backdrop-close convention
// already used by MobileMenu, just adapted to a centered card instead of a
// full-bleed nav sheet.
export function EntryDetailPanel({
  entry,
  onClose,
  emptyLabel,
  closeLabel,
}: {
  entry: DetailEntry | null;
  onClose: () => void;
  emptyLabel: string;
  closeLabel: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!entry) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    focusable?.[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [entry, onClose]);

  return (
    <AnimatePresence>
      {entry && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: "color-mix(in srgb, var(--bg-inverted) 55%, transparent)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="entry-detail-title"
            className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-lg border p-6 md:rounded-lg"
            style={{ background: "var(--bg)", borderColor: "var(--line)" }}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 id="entry-detail-title" className="type-card-title text-lg">{entry.name}</h3>
                <p className="type-index mt-1 text-sm" style={{ color: "var(--fg-3)" }}>
                  {entry.meta}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                data-cursor="true"
                aria-label={closeLabel}
                title={closeLabel}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
                style={{ color: "var(--fg-3)" }}
              >
                <X aria-hidden="true" size={17} strokeWidth={1.8} />
              </button>
            </div>

            {entry.tags && entry.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <TagPill key={tag} tag={tag} />
                ))}
              </div>
            )}

            <div className="mt-6 border-t pt-5" style={{ borderColor: "var(--line)" }}>
              {entry.aiSummary ? (
                <div
                  className="rich-content space-y-3 text-[15px] leading-relaxed [&_p]:mt-0"
                  style={{ color: "var(--fg-2)" }}
                  dangerouslySetInnerHTML={{ __html: entry.aiSummary }}
                />
              ) : (
                <p className="text-sm" style={{ color: "var(--fg-3)" }}>
                  {emptyLabel}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
