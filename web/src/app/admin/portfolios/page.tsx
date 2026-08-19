import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPortfoliosPage() {
  const portfolios = await prisma.portfolioBuild.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Portfolio builder</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--fg-3)" }}>
            Pick a subset of your projects and generate a shareable, application-specific portfolio.
          </p>
        </div>
        <Link
          href="/admin/portfolios/new"
          className="rounded-lg px-4 py-2 text-sm font-medium"
          style={{ background: "var(--fg)", color: "var(--bg)" }}
        >
          New portfolio
        </Link>
      </div>

      <div className="divide-y" style={{ borderColor: "var(--line)" }}>
        {portfolios.length === 0 && (
          <p className="py-6 text-sm" style={{ color: "var(--fg-3)" }}>
            No portfolios yet.
          </p>
        )}
        {portfolios.map((p) => (
          <Link key={p.id} href={`/admin/portfolios/${p.id}`} className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-xs" style={{ color: "var(--fg-3)" }}>
                /p/{p.slug} · {p.items.length} project(s) · {p.isPublished ? "published" : "draft"}
              </p>
            </div>
            <span style={{ color: "var(--fg-3)" }}>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
