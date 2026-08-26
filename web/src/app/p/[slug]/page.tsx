import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, Mail } from "lucide-react";
import { getPortfolioBySlug } from "@/lib/data";
import { Reveal } from "@/components/reveal";
import { Magnetic } from "@/components/magnetic";
import { PortfolioViewBeacon } from "@/components/portfolio-view-beacon";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Shared portfolio",
  robots: { index: false, follow: false },
};

const ACCENT_VAR: Record<string, string> = {
  teal: "var(--accent-robotics)",
  violet: "var(--accent-ai)",
  signal: "var(--accent-signal)",
};

export default async function PortfolioSharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const portfolio = await getPortfolioBySlug(slug);
  if (!portfolio) notFound();

  const accent = ACCENT_VAR[portfolio.accent] || ACCENT_VAR.teal;

  return (
    <main className="py-20">
      <PortfolioViewBeacon slug={portfolio.slug} />
      <div className="wrap max-w-3xl">
        <p className="type-page-kicker" style={{ color: accent }}>
          {portfolio.targetOrg ? `Prepared for ${portfolio.targetOrg}` : "Application portfolio"}
        </p>
        <h1 className="type-page-title mt-4">
          Hayward Kim{portfolio.targetRole ? ` / ${portfolio.targetRole}` : ""}
        </h1>
        {portfolio.intro && (
          <p className="mt-6 text-lg leading-relaxed" style={{ color: "var(--fg-2)" }}>
            {portfolio.intro}
          </p>
        )}

        <div className="mt-16 space-y-14">
          {portfolio.items.map((item, i) => (
            <Reveal key={item.project.slug} delay={Math.min(i * 0.05, 0.3)}>
              <div className="border-t pt-8" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-start justify-between gap-4">
                  <h2 className="type-card-title text-2xl">{item.project.name}</h2>
                  {item.project.awards[0] && (
                    <span className="type-label shrink-0" style={{ color: accent }}>
                      {item.project.awards[0].rankLabel}
                    </span>
                  )}
                </div>
                {item.highlightNote && (
                  <p className="font-display-condensed mt-2 text-sm font-semibold" style={{ color: accent }}>
                    {item.highlightNote}
                  </p>
                )}
                <p className="mt-3 leading-relaxed" style={{ color: "var(--fg-2)" }}>
                  {item.project.descKo || item.project.descEn}
                </p>
                <a
                  href={`/project/${item.project.slug}`}
                  className="type-nav mt-4 inline-flex items-center gap-1.5 text-xs"
                  style={{ color: "var(--fg-3)" }}
                >
                  Full project page
                  <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.8} />
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-20 border-t pt-10" style={{ borderColor: "var(--line)" }}>
          <Magnetic strength={0.3}>
            <a
              href="mailto:hayward_kim@korea.ac.kr"
              className="type-nav inline-flex h-12 items-center gap-2 rounded-lg px-6 text-sm"
              style={{ background: "var(--fg)", color: "var(--bg)" }}
            >
              <Mail aria-hidden="true" size={16} strokeWidth={1.8} />
              hayward_kim@korea.ac.kr
            </a>
          </Magnetic>
        </div>
      </div>
    </main>
  );
}
