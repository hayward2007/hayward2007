"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/competitions", label: "Competitions" },
  { href: "/admin/activities", label: "Activities" },
  { href: "/admin/portfolios", label: "Portfolio builder" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/analytics", label: "Analytics" },
];

export function AdminNav() {
  const pathname = usePathname();

  if (pathname === "/admin/login") return null;

  return (
    <div className="border-b" style={{ borderColor: "var(--line)" }}>
      <div className="wrap flex h-14 min-w-0 items-center gap-3">
        <nav aria-label="Admin" className="no-scrollbar type-nav flex min-w-0 flex-1 items-center gap-5 overflow-x-auto text-xs">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className="shrink-0"
              style={{ color: pathname === link.href ? "var(--fg)" : "var(--fg-3)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="type-nav flex shrink-0 items-center gap-2 border-l pl-3 text-xs"
          style={{ color: "var(--fg-3)", borderColor: "var(--line)" }}
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            // Hard navigation: guarantees the cleared session cookie is honored on
            // the very next request instead of risking a stale client-router cache.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.href = "/admin/login";
          }}
        >
          <LogOut aria-hidden="true" size={14} strokeWidth={1.8} />
          Sign out
        </button>
      </div>
    </div>
  );
}
