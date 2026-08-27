"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, X } from "lucide-react";

export type NavItem = { num: string; label: string; href: string };

export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  // document.body isn't available during SSR, and createPortal needs a real
  // node — this flips true in an effect, so the portal only ever mounts
  // client-side, after hydration.
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // One-time client-only mount flag gating the portal target; not
    // derivable during SSR render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    // No explicit scroll-lock here on purpose: the open panel (portaled)
    // plus the header together already cover the entire viewport, so
    // there's no exposed background gap to scroll through in the first
    // place. Setting overflow: hidden on html/body while the page is
    // already scrolled down turns out to actively break this header — it
    // makes Chromium (and presumably other engines) drop the header's
    // position: sticky "stuck" state and reflow it back to its natural
    // in-flow position, which is far off-screen (at -scrollY), taking the
    // menu's own toggle button with it. Simplest fix is to just not touch
    // overflow at all.
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

      {mounted &&
        createPortal(
          // AnimatePresence needs to be the thing directly wrapping the
          // conditional motion.div — nesting createPortal *inside* it (i.e.
          // {open && createPortal(<motion.div>...)}) put a ReactPortal
          // object where AnimatePresence expected a clonable element, and
          // it silently failed to mount anything. Portaling this whole
          // block instead keeps AnimatePresence's child perfectly normal;
          // only the mount point moves.
          <AnimatePresence>
            {open && (
              <motion.div
                ref={panelRef}
                id="mobile-navigation"
                role="dialog"
                aria-modal="true"
                aria-label="Site navigation"
                // Rendered to a portal on document.body rather than staying
                // nested inside <header>: once scrolled, the header picks up
                // backdrop-blur (a CSS filter), and any filter on an
                // ancestor makes it the *containing block* for
                // position:fixed descendants. That silently re-anchors this
                // panel's top/bottom offsets to the ~65px-tall header box
                // instead of the viewport, collapsing it to zero height —
                // the menu opens but renders nothing tappable. A portal
                // sidesteps the containing-block chain entirely, independent
                // of whatever styles the header ends up with.
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
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
