"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, X } from "lucide-react";

export type NavItem = { num: string; label: string; href: string };

export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    focusable?.[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ color: "var(--fg-3)" }}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close menu" : "Open menu"}
        title={open ? "Close menu" : "Open menu"}
      >
        {open ? <X aria-hidden="true" size={19} strokeWidth={1.8} /> : <Menu aria-hidden="true" size={20} strokeWidth={1.8} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed inset-x-0 top-[65px] bottom-0 z-40 overflow-y-auto"
            style={{ background: "var(--bg)" }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <nav className="wrap flex flex-col py-6">
              {items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`) ||
                  (item.href === "/play" && pathname.startsWith("/tools"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 border-b py-4"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <span className="type-index text-sm" style={{ color: "var(--accent-robotics)" }}>
                      {item.num}
                    </span>
                    <span
                      className="type-card-title text-2xl"
                      style={{ fontStyle: active ? "italic" : "normal", color: active ? "var(--fg)" : "var(--fg-2)" }}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
              <Link
                href="/search"
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-4 border-b py-4"
                style={{ borderColor: "var(--line)" }}
              >
                <span className="type-index text-sm" style={{ color: "var(--accent-robotics)" }}>
                  <Search size={14} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="type-card-title text-2xl" style={{ color: "var(--fg-2)" }}>
                  Search
                </span>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
