import type { CSSProperties } from "react";
import { Reveal } from "@/components/reveal";
import type { CaseStudyDecision, CaseStudyMedia, ProjectCaseStudy } from "@/lib/project-case-studies";

const ACCENT_BY_KIND = {
  robotics: "var(--accent-robotics)",
  ai: "var(--accent-ai)",
  signal: "var(--accent-signal)",
} as const;

function StudyMedia({ media }: { media: CaseStudyMedia }) {
  const gridClass =
    media.items.length === 1
      ? "grid-cols-1"
      : media.items.length === 3
        ? "md:grid-cols-3"
        : "md:grid-cols-2";

  return (
    <figure className="my-10">
      <div
        className={`grid gap-3 overflow-hidden rounded-lg p-3 ${gridClass}`}
        style={{ background: "color-mix(in srgb, var(--fg) 7%, transparent)" }}
      >
        {media.items.map((item, index) => (
          <div
            key={item.src}
            className={`relative min-h-[220px] overflow-hidden rounded-lg bg-white md:min-h-[300px] ${
              media.items.length > 3 && media.items.length % 2 === 1 && index === media.items.length - 1
                ? "md:col-span-2"
                : ""
            }`}
          >
            {/* Figma exports are committed locally so the page does not depend on expiring asset URLs. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.src} alt={item.alt} className="absolute inset-0 h-full w-full object-contain" loading="lazy" />
          </div>
        ))}
      </div>
      <figcaption className="mt-3 text-center text-sm" style={{ color: "var(--fg-3)" }}>
        {media.caption}
      </figcaption>
    </figure>
  );
}

const STEP_ROWS: Array<{ key: keyof Pick<CaseStudyDecision, "issue" | "framing" | "options" | "solution">; label: string }> = [
  { key: "issue", label: "이슈" },
  { key: "framing", label: "문제 정의" },
  { key: "options", label: "해결책 구상" },
  { key: "solution", label: "솔루션" },
];

function DecisionBlock({ decision }: { decision: CaseStudyDecision }) {
  return (
    <article className="border-t py-10 first:mt-2" style={{ borderColor: "var(--line-strong)" }}>
      <h3 className="type-card-title mb-7 text-xl leading-snug">{decision.title}</h3>
      <div className="space-y-6">
        {STEP_ROWS.map(({ key, label }) => (
          <div key={key} className="grid grid-cols-1 gap-3 sm:grid-cols-[112px_1fr] sm:gap-8">
            <div>
              <span
                className="type-label inline-flex min-h-7 items-center rounded-md px-2.5"
                style={{ background: "var(--case-accent-soft)", color: "var(--case-accent)" }}
              >
                {label}
              </span>
            </div>
            <p className="max-w-3xl text-[17px] leading-8" style={{ color: "var(--fg-2)" }}>
              {decision[key]}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

export function ProjectCaseStudyView({ study }: { study: ProjectCaseStudy }) {
  const accent = ACCENT_BY_KIND[study.accent];
  const style = {
    "--case-accent": accent,
    "--case-accent-soft": `color-mix(in srgb, ${accent} 13%, transparent)`,
    background: "var(--bg)",
    color: "var(--fg)",
  } as CSSProperties;

  return (
    <div style={style} lang="ko">
      <section id="overview" className="scroll-mt-24 border-b py-20 md:py-28" style={{ borderColor: "var(--line)" }}>
        <div className="wrap grid grid-cols-1 gap-14 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-20">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <p className="type-page-kicker" style={{ color: "var(--case-accent)" }}>
                Case study
              </p>
              <nav aria-label={`${study.name} 목차`} className="mt-8 hidden border-t lg:block" style={{ borderColor: "var(--line)" }}>
                {study.chapters.map((chapter) => (
                  <a
                    key={chapter.id}
                    href={`#${chapter.id}`}
                    className="grid min-h-12 grid-cols-[32px_1fr] items-center gap-2 border-b py-2 text-sm transition-colors hover:[color:var(--case-accent)]"
                    style={{ borderColor: "var(--line)", color: "var(--fg-3)" }}
                  >
                    <span className="type-index text-xs">{chapter.number}</span>
                    <span className="font-display line-clamp-2 font-semibold">{chapter.title}</span>
                  </a>
                ))}
              </nav>
            </div>
          </Reveal>

          <div>
            <Reveal delay={0.08}>
              <p className="font-display max-w-4xl text-2xl font-semibold leading-relaxed md:text-3xl">{study.summary[0]}</p>
              {study.summary.slice(1).map((paragraph) => (
                <p key={paragraph} className="mt-6 max-w-4xl text-lg leading-8" style={{ color: "var(--fg-2)" }}>
                  {paragraph}
                </p>
              ))}
            </Reveal>

            <Reveal delay={0.14}>
              <div className="mt-14 grid grid-cols-2 border-y md:grid-cols-4" style={{ borderColor: "var(--line-strong)" }}>
                {study.metrics.map((metric) => (
                  <div
                    key={`${metric.value}-${metric.label}`}
                    className="min-h-[132px] border-b p-4 even:border-l md:border-b-0 md:border-l md:first:border-l-0"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <p className="type-stat" style={{ color: "var(--case-accent)" }}>
                      {metric.value}
                    </p>
                    <p className="font-display mt-3 text-sm font-semibold">{metric.label}</p>
                    {metric.detail && (
                      <p className="mt-1 text-xs leading-5" style={{ color: "var(--fg-3)" }}>
                        {metric.detail}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {study.chapters.map((chapter, chapterIndex) => (
        <section
          id={chapter.id}
          key={chapter.id}
          className="scroll-mt-20 border-b py-20 md:py-28"
          style={{
            borderColor: "var(--line)",
            background: chapterIndex % 2 === 1 ? "var(--bg-raised)" : "var(--bg)",
          }}
        >
          <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-20">
            <Reveal>
              <div className="flex items-baseline gap-4 lg:block">
                <span className="type-index text-sm" style={{ color: "var(--case-accent)" }}>
                  {chapter.number}
                </span>
                <h2 className="type-section-title mt-0 max-w-sm leading-snug lg:mt-5">{chapter.title}</h2>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="min-w-0">
                {chapter.summary?.map((paragraph) => (
                  <p key={paragraph} className="mb-6 max-w-4xl text-lg leading-8" style={{ color: "var(--fg-2)" }}>
                    {paragraph}
                  </p>
                ))}

                {chapter.media && <StudyMedia media={chapter.media} />}

                {chapter.decisions?.map((decision) => <DecisionBlock key={decision.title} decision={decision} />)}

                {chapter.findings && chapter.findings.length > 0 && (
                  <div className="mt-8 border-t" style={{ borderColor: "var(--line-strong)" }}>
                    {chapter.findings.map((finding, index) => (
                      <div
                        key={finding}
                        className="grid grid-cols-[36px_1fr] gap-3 border-b py-4 text-[15px] leading-7"
                        style={{ borderColor: "var(--line)", color: "var(--fg-2)" }}
                      >
                        <span className="type-index text-sm" style={{ color: "var(--case-accent)" }}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>{finding}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      ))}

      <section className="py-20 md:py-28" style={{ background: "var(--bg-inverted)", color: "var(--fg-inverted)" }}>
        <div className="wrap grid grid-cols-1 gap-14 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-20">
          <Reveal>
            <p className="type-page-kicker" style={{ color: "var(--case-accent)" }}>
              Conclusion
            </p>
          </Reveal>
          <div>
            <Reveal delay={0.08}>
              {study.conclusion.map((paragraph) => (
                <p key={paragraph} className="font-display max-w-4xl text-2xl font-semibold leading-relaxed md:text-3xl">
                  {paragraph}
                </p>
              ))}
            </Reveal>

            <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2">
              <Reveal delay={0.12}>
                <h2 className="type-card-title text-lg">남은 한계</h2>
                <div className="mt-5 border-t" style={{ borderColor: "color-mix(in srgb, var(--fg-inverted) 24%, transparent)" }}>
                  {study.limitations.map((limitation, index) => (
                    <div
                      key={limitation}
                      className="grid grid-cols-[30px_1fr] gap-3 border-b py-4 text-sm leading-6"
                      style={{
                        borderColor: "color-mix(in srgb, var(--fg-inverted) 12%, transparent)",
                        color: "color-mix(in srgb, var(--fg-inverted) 72%, transparent)",
                      }}
                    >
                      <span className="type-index text-sm">{String(index + 1).padStart(2, "0")}</span>
                      <span>{limitation}</span>
                    </div>
                  ))}
                </div>
              </Reveal>

              {study.nextSteps && study.nextSteps.length > 0 && (
                <Reveal delay={0.16}>
                  <h2 className="type-card-title text-lg">다음 단계</h2>
                  <div className="mt-5 border-t" style={{ borderColor: "color-mix(in srgb, var(--fg-inverted) 24%, transparent)" }}>
                    {study.nextSteps.map((step, index) => (
                      <div
                        key={step}
                        className="grid grid-cols-[30px_1fr] gap-3 border-b py-4 text-sm leading-6"
                        style={{
                          borderColor: "color-mix(in srgb, var(--fg-inverted) 12%, transparent)",
                          color: "color-mix(in srgb, var(--fg-inverted) 72%, transparent)",
                        }}
                      >
                        <span className="type-index text-sm" style={{ color: "var(--case-accent)" }}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
