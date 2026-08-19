"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleToggle } from "@/components/locale-toggle";
import { Magnetic } from "@/components/magnetic";
import { MobileMenu, type NavItem } from "@/components/mobile-menu";
import { useDict } from "@/components/locale-provider";

export function SiteHeader() {
  const pathname = usePathname();
  const dict = useDict();
  const [scrolled, setScrolled] = useState(false);

  const nav: NavItem[] = [
    { num: "01", label: dict.nav.about, href: "/about" },
    { num: "02", label: dict.nav.projects, href: "/projects" },
    { num: "03", label: dict.nav.awards, href: "/awards" },
    { num: "04", label: dict.nav.play, href: "/play" },
    { num: "05", label: dict.nav.contact, href: "/social" },
  ];

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-200 ${
        scrolled ? "border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur" : "border-transparent"
      }`}
    >
      <div className="wrap grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4">
        <Link href="/about" className="text-sm font-semibold tracking-tight" data-cursor="true">
          HAYWARD.KIM
        </Link>

        <nav className="hidden items-center justify-center gap-1 text-[13px] md:flex">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`) ||
              (item.href === "/play" && pathname.startsWith("/tools"));
            return (
              <Link
                key={item.href}
                href={item.href}
                data-cursor="true"
                className="rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors duration-150"
                style={{
                  background: active ? "var(--fg)" : "transparent",
                  color: active ? "var(--bg)" : "var(--fg-3)",
                }}
              >
                {item.num} {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin"
            data-cursor="true"
            className="hidden font-mono text-[11px] uppercase tracking-[0.06em] lg:inline"
            style={{ color: "var(--fg-4)" }}
          >
            {dict.nav.admin}
          </Link>
          <Magnetic strength={0.22}>
            <Link
              href="/search"
              data-cursor="true"
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-sm"
            >
              🔍
            </Link>
          </Magnetic>
          <Magnetic strength={0.22}>
            <LocaleToggle className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] font-mono text-[10px]" />
          </Magnetic>
          <Magnetic strength={0.22}>
            <ThemeToggle className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)]" />
          </Magnetic>
          <MobileMenu items={nav} />
        </div>
      </div>
    </header>
  );
}
