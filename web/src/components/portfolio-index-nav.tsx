"use client";

import { useEffect, useRef, useState } from "react";

export type PortfolioNavItem = { id: string; num: string; label: string };

// Sticky left rail for the "01 — Portfolio" page: a numbered section index
// (active section tracked via IntersectionObserver, not scroll math) plus
// social links pinned to the bottom. Desktop (lg+) only — the global
// SiteHeader is already sticky on every page, so mobile just relies on plain
// scroll instead of stacking a second sticky bar.
export function PortfolioIndexNav({
  items,
  email,
  github,
  linkedin,
}: {
  items: PortfolioNavItem[];
  email: string;
  github: string;
  linkedin: string;
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const sections = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => Boolean(el));

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    sections.forEach((section) => observerRef.current?.observe(section));
    return () => observerRef.current?.disconnect();
  }, [items]);

  // The last section rarely fills the observer's mid-viewport band on its
  // own (nothing below it to push it up into view), so it can stay
  // permanently un-highlighted even once the user has scrolled all the way
  // to it — force it active once the page is scrolled to the bottom.
  useEffect(() => {
    const lastId = items[items.length - 1]?.id;
    if (!lastId) return;

    function onScroll() {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) setActive(lastId);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return (
    <aside className="hidden lg:sticky lg:top-24 lg:flex lg:h-[calc(100dvh-7rem)] lg:flex-col lg:justify-between">
      <nav aria-label="Sections">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  data-cursor="true"
                  className="group flex items-center gap-3 rounded-md py-1.5"
                >
                  <span
                    aria-hidden="true"
                    className="h-px shrink-0 transition-all duration-300 group-hover:w-6"
                    style={{
                      width: isActive ? "24px" : "12px",
                      background: isActive ? "var(--accent-robotics)" : "var(--line-strong)",
                    }}
                  />
                  <span
                    className="type-index text-xs tabular-nums transition-colors"
                    style={{ color: isActive ? "var(--accent-robotics)" : "var(--fg-4)" }}
                  >
                    {item.num}
                  </span>
                  <span
                    className="type-nav text-[11px] transition-colors"
                    style={{ color: isActive ? "var(--fg)" : "var(--fg-3)" }}
                  >
                    {item.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex flex-col gap-3">
        <div className="type-label flex items-center gap-4">
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="true"
            className="transition-colors hover:[color:var(--fg)]"
            style={{ color: "var(--fg-3)" }}
          >
            GitHub
          </a>
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="true"
            className="transition-colors hover:[color:var(--fg)]"
            style={{ color: "var(--fg-3)" }}
          >
            LinkedIn
          </a>
          <a
            href={`mailto:${email}`}
            data-cursor="true"
            className="transition-colors hover:[color:var(--fg)]"
            style={{ color: "var(--fg-3)" }}
          >
            Email
          </a>
        </div>
        <a href={`mailto:${email}`} data-cursor="true" className="type-label normal-case transition-colors hover:[color:var(--fg)]" style={{ color: "var(--fg-3)" }}>
          {email}
        </a>
      </div>
    </aside>
  );
}
