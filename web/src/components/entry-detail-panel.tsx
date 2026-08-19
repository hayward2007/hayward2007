"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  useEffect(() => {
    if (!entry) return;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
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
            className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border p-6 md:rounded-2xl"
            style={{ background: "var(--bg)", borderColor: "var(--line)" }}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-lg font-medium">{entry.name}</h3>
                <p className="mt-1 font-mono text-xs" style={{ color: "var(--fg-3)" }}>
                  {entry.meta}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                data-cursor="true"
                className="shrink-0 font-mono text-xs uppercase tracking-[0.08em]"
                style={{ color: "var(--fg-3)" }}
              >
                {closeLabel}
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
                  className="space-y-3 text-[15px] leading-relaxed [&_p]:mt-0"
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
