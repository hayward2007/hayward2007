import Link from "next/link";
import Image from "next/image";
import { getCounts, getLastSync, getPublicProjects, getCompetitions } from "@/lib/data";
import { getServerDict } from "@/lib/locale-server";
import { Hero } from "@/components/hero";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [counts, syncedAt, projects, competitions, { dict }] = await Promise.all([
    getCounts(),
    getLastSync(),
    getPublicProjects(),
    getCompetitions(),
    getServerDict(),
  ]);
  const selectedProjects = projects.slice(0, 3);
  const recordEntries = competitions.filter((c) => c.isAward).slice(0, 4);

  return (
    <main>
      <Hero />

      <section className="border-t py-20 md:py-24" style={{ borderColor: "var(--line)" }}>
        <div className="wrap grid grid-cols-1 gap-14 md:grid-cols-[0.75fr_1.25fr]">
          <Reveal>
            <Image
              src="/assets/banner.jpeg"
              alt="Hayward Kim"
              width={1800}
              height={1200}
              priority
              className="w-full rounded-2xl object-cover grayscale"
              style={{ aspectRatio: "4 / 5" }}
            />
          </Reveal>
          <Reveal delay={0.06}>
            <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-robotics)" }}>
              {dict.about.eyebrow}
            </p>
            <h1 className="mt-5 text-3xl font-semibold leading-snug tracking-tight md:text-4xl">
              {dict.about.title}
            </h1>
            <p className="mt-6 max-w-lg text-lg italic leading-relaxed" style={{ color: "var(--fg)" }}>
              {dict.about.quote}
            </p>
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
              {dict.about.bio}
            </p>

            <div className="mt-8 space-y-2 border-t pt-6" style={{ borderColor: "var(--line)" }}>
              <p className="font-mono text-[11px] uppercase tracking-[0.1em]" style={{ color: "var(--fg-3)" }}>
                {dict.about.highlightsTitle}
              </p>
              {dict.about.highlights.map((item) => (
                <div key={item.year} className="flex gap-4 text-sm">
                  <span className="w-14 shrink-0 font-mono tabular-nums" style={{ color: "var(--accent-robotics)" }}>
                    {item.year}
                  </span>
                  <span style={{ color: "var(--fg-2)" }}>{item.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-10 border-t pt-6" style={{ borderColor: "var(--line)" }}>
              <div>
                <p className="text-2xl font-semibold tabular-nums">{counts.competitions}</p>
                <p className="text-sm" style={{ color: "var(--fg-3)" }}>
                  {dict.about.competitionsEntered}
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums">{counts.visibleProjects}</p>
                <p className="text-sm" style={{ color: "var(--fg-3)" }}>
                  {dict.about.projectsShipped}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t py-16" style={{ borderColor: "var(--line)" }}>
        <div className="wrap grid grid-cols-1 gap-14 md:grid-cols-2">
          <Reveal>
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-robotics)" }}>
                {dict.about.projectsSummaryTitle}
              </p>
              <Link href="/projects" data-cursor="true" className="shrink-0 font-mono text-xs" style={{ color: "var(--fg-3)" }}>
                {dict.common.seeMore}
              </Link>
            </div>
            <div className="mt-6 space-y-5">
              {selectedProjects.map((project) => (
                <Link
                  key={project.slug}
                  href={`/project/${project.slug}`}
                  data-cursor="View project"
                  className="group block border-t pt-5 first:border-t-0 first:pt-0"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="min-w-0 truncate text-lg font-medium">{project.name}</h3>
                    <span
                      className="mt-1 shrink-0 font-mono text-xs opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ color: "var(--accent-robotics)" }}
                    >
                      →
                    </span>
                  </div>
                  {(project.descKo || project.descEn) && (
                    <p className="mt-1 line-clamp-1 text-sm" style={{ color: "var(--fg-3)" }}>
                      {project.descKo || project.descEn}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-signal)" }}>
                {dict.about.recordSummaryTitle}
              </p>
              <Link href="/awards" data-cursor="true" className="shrink-0 font-mono text-xs" style={{ color: "var(--fg-3)" }}>
                {dict.common.seeMore}
              </Link>
            </div>
            <div className="mt-6 space-y-5">
              {recordEntries.map((c) => (
                <div key={c.id} className="flex gap-4 border-t pt-5 first:border-t-0 first:pt-0" style={{ borderColor: "var(--line)" }}>
                  <span className="w-14 shrink-0 font-mono text-xs tabular-nums" style={{ color: "var(--accent-signal)" }}>
                    {c.year}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    {c.rankLabel && (
                      <p className="mt-0.5 text-xs" style={{ color: "var(--fg-3)" }}>
                        {c.rankLabel}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="py-8" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="wrap flex flex-col gap-2 text-xs md:flex-row md:items-center md:justify-between" style={{ color: "var(--fg-4)" }}>
          <span>© {new Date().getFullYear()} Hayward Kim</span>
          {syncedAt && <span>Synced {new Date(syncedAt).toLocaleDateString()}</span>}
        </div>
      </footer>
    </main>
  );
}
