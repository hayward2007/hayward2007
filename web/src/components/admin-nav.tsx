"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
      <div className="wrap flex h-14 items-center justify-between">
        <nav className="flex items-center gap-6 text-sm">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ color: pathname === link.href ? "var(--fg)" : "var(--fg-3)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="text-sm"
          style={{ color: "var(--fg-3)" }}
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            // Hard navigation: guarantees the cleared session cookie is honored on
            // the very next request instead of risking a stale client-router cache.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.href = "/admin/login";
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
