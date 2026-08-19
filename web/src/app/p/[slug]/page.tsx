import { notFound } from "next/navigation";
import { getPortfolioBySlug } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/reveal";
import { Magnetic } from "@/components/magnetic";

export const dynamic = "force-dynamic";

const ACCENT_VAR: Record<string, string> = {
  teal: "var(--accent-robotics)",
  violet: "var(--accent-ai)",
  signal: "var(--accent-signal)",
};

export default async function PortfolioSharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const portfolio = await getPortfolioBySlug(slug);
  if (!portfolio) notFound();

  await prisma.portfolioBuild.update({ where: { slug }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const accent = ACCENT_VAR[portfolio.accent] || ACCENT_VAR.teal;

  return (
    <main className="py-20">
      <div className="wrap max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: accent }}>
          {portfolio.targetOrg ? `Prepared for ${portfolio.targetOrg}` : "Application portfolio"}
        </p>
        <h1 className="mt-4 text-[clamp(2rem,5vw,3.4rem)] font-semibold tracking-tight">
          Hayward Kim{portfolio.targetRole ? ` — ${portfolio.targetRole}` : ""}
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
                  <h2 className="text-2xl font-medium">{item.project.name}</h2>
                  {item.project.awards[0] && (
                    <span className="shrink-0 font-mono text-xs" style={{ color: accent }}>
                      {item.project.awards[0].rankLabel}
                    </span>
                  )}
                </div>
                {item.highlightNote && (
                  <p className="mt-2 text-sm font-medium" style={{ color: accent }}>
                    {item.highlightNote}
                  </p>
                )}
                <p className="mt-3 leading-relaxed" style={{ color: "var(--fg-2)" }}>
                  {item.project.descKo || item.project.descEn}
                </p>
                <a
                  href={`/project/${item.project.slug}`}
                  className="mt-3 inline-block text-sm underline"
                  style={{ color: "var(--fg-3)" }}
                >
                  Full project page →
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-20 border-t pt-10" style={{ borderColor: "var(--line)" }}>
          <Magnetic strength={0.3}>
            <a
              href="mailto:hayward_kim@korea.ac.kr"
              className="inline-flex h-12 items-center rounded-full px-6 text-sm font-medium"
              style={{ background: "var(--fg)", color: "var(--bg)" }}
            >
              hayward_kim@korea.ac.kr
            </a>
          </Magnetic>
        </div>
      </div>
    </main>
  );
}
