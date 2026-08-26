"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
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
        scrolled ? "border-[var(--line)] bg-[var(--bg)]/88 backdrop-blur-xl" : "border-transparent"
      }`}
    >
      <div className="wrap grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4">
        <Link href="/about" className="font-display-expanded text-[15px] leading-none" data-cursor="true">
          HAYWARD.KIM
        </Link>

        <nav className="hidden items-center justify-center gap-0.5 md:flex">
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
                className="type-nav rounded-full px-3.5 py-2 text-[11px] transition-colors duration-150"
                style={{
                  background: active ? "var(--fg)" : "transparent",
                  color: active ? "var(--bg)" : "var(--fg-3)",
                  fontWeight: active ? 800 : 650,
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
            className="type-nav hidden text-[11px] lg:inline"
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
              <Search size={16} strokeWidth={1.8} aria-hidden="true" />
            </Link>
          </Magnetic>
          <Magnetic strength={0.22}>
            <LocaleToggle className="type-index flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[11px]" />
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
