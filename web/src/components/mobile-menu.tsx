"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type NavItem = { num: string; label: string; href: string };

export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em]"
        style={{ color: "var(--fg-3)" }}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? "Close" : "Menu"}
        <span className="relative flex h-3 w-4 flex-col justify-between">
          <span
            className="h-px w-full bg-current transition-transform duration-200"
            style={{ transform: open ? "translateY(5.5px) rotate(45deg)" : "none" }}
          />
          <span
            className="h-px w-full bg-current transition-opacity duration-150"
            style={{ opacity: open ? 0 : 1 }}
          />
          <span
            className="h-px w-full bg-current transition-transform duration-200"
            style={{ transform: open ? "translateY(-5.5px) rotate(-45deg)" : "none" }}
          />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
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
                    <span className="font-mono text-xs" style={{ color: "var(--accent-robotics)" }}>
                      {item.num}
                    </span>
                    <span
                      className="text-2xl font-medium"
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
                <span className="font-mono text-xs" style={{ color: "var(--accent-robotics)" }}>
                  🔍
                </span>
                <span className="text-2xl font-medium" style={{ color: "var(--fg-2)" }}>
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
