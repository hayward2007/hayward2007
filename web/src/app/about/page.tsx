import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { getLastSync, getPublicProjects, getCompetitions, getPublicActivities } from "@/lib/data";
import { getServerDict } from "@/lib/locale-server";
import { Reveal } from "@/components/reveal";
import { PortfolioIndexNav } from "@/components/portfolio-index-nav";
import { Pictogram } from "@/components/pictogram";
import { SkillTag } from "@/components/skill-tag";
import { SKILL_CATEGORIES } from "@/lib/skills";
import { HighlightCard } from "@/components/highlight-card";

export const metadata: Metadata = { title: "Portfolio" };

export const dynamic = "force-dynamic";

const PROJECTS_LIMIT = 6;
// Single semantic accent (globals.css: --accent, currently aliased to
// --accent-robotics) instead of rotating through all three named accents —
// recoloring the whole page's emphasis color is then a one-variable edit.
const ACCENT = "var(--accent)";

// Award/activity names carry their year as a literal prefix in the synced
// Notion data (e.g. "2024 대한민국 인재상") — stripped on display since the
// year already renders in its own column right next to it.
function stripLeadingYear(name: string) {
  return name.replace(/^\d{4}\s+/, "");
}

function SectionHeader({ num, title, count }: { num: string; title: string; count?: number }) {
  return (
    <header className="mb-7 flex items-end justify-between gap-4 border-b pb-4" style={{ borderColor: "var(--line-strong)" }}>
      <div className="flex items-baseline gap-3">
        <span className="type-index text-sm tabular-nums" style={{ color: ACCENT }}>
          {num}
        </span>
        <h2 className="type-section-title uppercase">{title}</h2>
      </div>
      {typeof count === "number" && (
        <span className="type-index text-sm tabular-nums" style={{ color: "var(--fg-4)" }}>
          {String(count).padStart(2, "0")}
        </span>
      )}
    </header>
  );
}

export default async function AboutPage() {
  const [syncedAt, projects, competitions, activities, { dict, locale }] = await Promise.all([
    getLastSync(),
    getPublicProjects(),
    getCompetitions(),
    getPublicActivities(),
    getServerDict(),
  ]);

  // Notion's "Priority" field is the user's own designation of which awards
  // matter most — getCompetitions already sorts by it, so the list here just
  // follows that same ordering.
  const awards = competitions.filter((c) => c.isAward);
  const skillCount = SKILL_CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0);

  const navItems = [
    { id: "highlights", num: "01", label: dict.about.sections.highlights },
    { id: "awards", num: "02", label: dict.about.sections.awards },
    { id: "activities", num: "03", label: dict.about.sections.activities },
    { id: "skills", num: "04", label: dict.about.sections.skills },
    { id: "education", num: "05", label: dict.about.sections.education },
    { id: "projects", num: "06", label: dict.about.sections.projects },
  ];

  return (
    <main className="py-12 md:py-16">
      <div className="wrap lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-x-16">
        <PortfolioIndexNav
          items={navItems}
          email="hayward_kim@korea.ac.kr"
          github="https://github.com/hayward2007"
          linkedin="https://www.linkedin.com/in/hayward-kim/"
        />

        <div className="flex min-w-0 max-w-[720px] flex-col">
          <header className="flex flex-col gap-6 pb-10 md:pb-14">
            <div className="grid grid-cols-[104px_minmax(0,1fr)] items-end gap-6 md:grid-cols-[minmax(0,1fr)_132px] md:gap-10">
              <Reveal>
                <h1
                  aria-label={`${dict.about.titleTop}, ${dict.about.titleBottom}`}
                  className="font-display-expanded text-4xl leading-[0.94] md:text-[56px]"
                >
                  {dict.about.titleTop}
                  <br />
                  <span style={{ color: "var(--fg-3)" }}>{dict.about.titleBottom}</span>
                </h1>
                <p className="type-quote mt-3 max-w-md text-sm leading-relaxed md:mt-4 md:text-lg" style={{ color: "var(--fg-2)" }}>
                  {dict.about.quote}
                </p>
              </Reveal>
              <figure
                className="order-first aspect-[413/531] w-[104px] shrink-0 overflow-hidden rounded-md border md:order-none md:w-[132px]"
                style={{ background: "var(--bg-raised)", borderColor: "var(--line-strong)" }}
              >
                <Image
                  src="/assets/profile-figma.jpeg"
                  alt="Hayward Kim"
                  width={413}
                  height={531}
                  priority
                  className="h-full w-full object-cover"
                />
              </figure>
            </div>
          </header>

          <section id="highlights" className="scroll-mt-20 border-t py-10 md:py-12" style={{ borderColor: "var(--line)" }}>
            <SectionHeader num="01" title={dict.about.highlightsTitle} count={dict.about.highlights.length} />
            <Reveal>
              <p className="font-display max-w-[650px] text-lg font-medium leading-[1.6] md:text-[21px]" style={{ color: "var(--fg-2)" }}>
                {dict.about.bio}
              </p>

              <div className="mt-8 flex flex-col border-y" style={{ borderColor: "var(--line-strong)" }}>
                {dict.about.highlights.map((item, i) => (
                  <HighlightCard
                    key={item}
                    index={i + 1}
                    label={dict.about.highlightLabels[i]}
                    accent={ACCENT}
                  >
                    {item}
                  </HighlightCard>
                ))}
              </div>
            </Reveal>
          </section>

          <section id="awards" className="scroll-mt-20 border-t py-10 md:py-12" style={{ borderColor: "var(--line)" }}>
            <SectionHeader num="02" title={dict.about.sections.awards} count={awards.length} />
            <Reveal>
              <ul className="flex flex-col">
                {awards.map((c) => (
                  <li
                    key={c.id}
                    className="grid grid-cols-[58px_minmax(0,1fr)_auto] items-center gap-4 border-t py-4 first:border-t-0 first:pt-0"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <span className="type-index text-sm tabular-nums" style={{ color: "var(--fg-3)" }}>
                      {c.year}
                    </span>
                    <p className="font-display min-w-0 truncate text-sm font-semibold">{stripLeadingYear(c.name)}</p>
                    {c.rankLabel && (
                      <span className="type-label shrink-0" style={{ color: "var(--accent-signal)" }}>
                        {c.rankLabel}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>

          <section id="activities" className="scroll-mt-20 border-t py-10 md:py-12" style={{ borderColor: "var(--line)" }}>
            <SectionHeader num="03" title={dict.about.sections.activities} count={activities.length} />
            <Reveal>
              <ul className="flex flex-col">
                {activities.map((a) => (
                  <li
                    key={a.id}
                    className="grid grid-cols-[58px_minmax(0,1fr)] items-center gap-4 border-t py-4 first:border-t-0 first:pt-0"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <span className="type-index text-sm tabular-nums" style={{ color: "var(--fg-3)" }}>
                      {a.year}
                    </span>
                    <p className="font-display min-w-0 truncate text-sm font-semibold">{stripLeadingYear(a.name)}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>

          <section id="skills" className="scroll-mt-20 border-t py-10 md:py-12" style={{ borderColor: "var(--line)" }}>
            <SectionHeader num="04" title={dict.about.sections.skills} count={skillCount} />
            <Reveal>
              <div className="flex flex-col">
                {SKILL_CATEGORIES.map((category) => (
                    <div
                      key={category.id}
                      className="grid grid-cols-1 gap-x-7 gap-y-3 border-t py-4 first:border-t-0 first:pt-0 md:grid-cols-[122px_1fr]"
                      style={{ borderColor: "var(--line)" }}
                    >
                      <p className="type-label" style={{ color: "var(--fg-3)" }}>
                        {locale === "ko" ? category.labelKo : category.labelEn}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        {category.items.map((item) => (
                          <SkillTag
                            key={item.name}
                            name={item.name}
                            path={item.path}
                            hex={item.hex}
                            primary={category.primary}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </Reveal>
          </section>

          <section id="education" className="scroll-mt-20 border-t py-10 md:py-12" style={{ borderColor: "var(--line)" }}>
            <SectionHeader num="05" title={dict.about.sections.education} count={dict.about.education.length} />
            <Reveal>
              <ul className="flex flex-col">
                {dict.about.education.map((edu) => (
                  <li
                    key={edu.institution}
                    className="grid grid-cols-[92px_minmax(0,1fr)] items-start gap-4 border-t py-4 first:border-t-0 first:pt-0"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <span className="type-index text-sm tabular-nums" style={{ color: "var(--fg-3)" }}>
                      {edu.cohort}
                    </span>
                    <div className="min-w-0">
                      <p className="font-display truncate text-sm font-semibold">{edu.institution}</p>
                      <p className="mt-0.5 truncate text-xs" style={{ color: "var(--fg-3)" }}>
                        {edu.program}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>

          <section id="projects" className="scroll-mt-20 border-t py-10 md:py-12" style={{ borderColor: "var(--line)" }}>
            <SectionHeader num="06" title={dict.about.sections.projects} count={projects.length} />
            <Reveal>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {projects.slice(0, PROJECTS_LIMIT).map((project) => {
                  const description = project.descKo || project.descEn;
                  return (
                    <li key={project.slug}>
                      <Link
                        href={`/project/${project.slug}`}
                        data-cursor="View project"
                        className="group relative flex min-h-[292px] h-full min-w-0 flex-col justify-end overflow-hidden rounded-md border p-5 transition-colors duration-300 hover:[border-color:var(--project-accent)]"
                        style={{ borderColor: "var(--line)", background: "var(--bg-raised)", "--project-accent": ACCENT } as CSSProperties}
                      >
                        <div className="absolute inset-0">
                          {project.cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={project.cover}
                              alt={`${project.name} thumbnail`}
                              className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-[1.025] group-hover:grayscale-0"
                              loading="lazy"
                            />
                          ) : (
                            <Pictogram
                              seedText={project.slug}
                              dotRadius={2.2}
                              complexity={1}
                              hoverStroke={ACCENT}
                              className="h-full w-full p-10"
                            />
                          )}
                        </div>
                        <div
                          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-[0.16]"
                          style={{ background: ACCENT }}
                        />
                        <div
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4"
                          style={{ background: "linear-gradient(to top, var(--bg-raised) 18%, transparent 100%)" }}
                        />
                        <div className="relative z-10 min-w-0">
                          <h3 className="type-card-title min-w-0 text-lg">{project.name}</h3>
                          {description && (
                            <p className="mt-2 line-clamp-3 text-sm leading-6" style={{ color: "var(--fg-3)" }}>
                              {description}
                            </p>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link href="/projects" data-cursor="true" className="type-label mt-6 inline-block border-b pb-1" style={{ color: "var(--fg-3)", borderColor: "var(--line-strong)" }}>
                {dict.common.seeMore}
              </Link>
            </Reveal>
          </section>
        </div>
      </div>

      <footer className="wrap mt-10 pt-8" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="flex flex-col gap-2 text-xs md:flex-row md:items-center md:justify-between" style={{ color: "var(--fg-4)" }}>
          <span>© {new Date().getFullYear()} Hayward Kim</span>
          {syncedAt && <span>Synced {new Date(syncedAt).toLocaleDateString()}</span>}
        </div>
      </footer>
    </main>
  );
}
