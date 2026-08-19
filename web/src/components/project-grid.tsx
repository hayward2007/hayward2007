"use client";

import Link from "next/link";
import { Pictogram } from "@/components/pictogram";
import { Reveal } from "@/components/reveal";
import { TiltCard } from "@/components/tilt-card";

type ProjectCard = {
  slug: string;
  name: string;
  descKo: string;
  descEn: string;
  cover: string;
  tags: string[];
};

// Repeating bento rhythm (6-column base, taewoopark.com-inspired but not copied 1:1):
// a big landscape tile paired with a square, a full-width strip, then a row of
// three squares — cycling for any project count via auto-flow. Leads with the
// hero+square pairing so even a short project list (2-3 items) still reads as
// a real bento layout instead of just stacked identical banners.
const PATTERN = [
  { col: 4, row: 2, kind: "hero", hoverStroke: "var(--accent-robotics)" },
  { col: 2, row: 2, kind: "square", hoverStroke: "var(--accent-ai)" },
  { col: 6, row: 1, kind: "banner", hoverStroke: "var(--accent-signal)" },
  { col: 2, row: 2, kind: "square", hoverStroke: "var(--accent-ai)" },
  { col: 2, row: 2, kind: "square", hoverStroke: "var(--accent-robotics)" },
  { col: 2, row: 2, kind: "square", hoverStroke: "var(--accent-signal)" },
  { col: 6, row: 1, kind: "banner", hoverStroke: "var(--accent-robotics)" },
] as const;

// Bigger tiles get a busier, more detailed generative graphic; the short banner
// strips stay simple so they don't look cluttered at that height.
const COMPLEXITY: Record<string, number> = { hero: 1.6, square: 1, banner: 0.6 };
const DOT_RADIUS: Record<string, number> = { hero: 2.4, square: 2.2, banner: 1.4 };

export function ProjectGrid({ projects }: { projects: ProjectCard[] }) {
  return (
    <div className="bento-grid grid grid-cols-1 gap-4 md:[grid-auto-rows:190px] md:[grid-template-columns:repeat(6,1fr)]">
      {projects.map((project, i) => {
        const span = PATTERN[i % PATTERN.length];
        const wide = span.col >= 4;

        return (
          // min-w-0: grid/flex items default to a min-width based on their content's
          // intrinsic size, which — once real project names/descriptions replaced the
          // placeholder copy — was forcing several tracks wider than their 1fr share
          // and pushing the whole grid into horizontal overflow.
          <div
            key={project.slug}
            className="min-w-0"
            style={{ gridColumn: `span ${span.col} / span ${span.col}`, gridRow: `span ${span.row} / span ${span.row}` }}
          >
            <Reveal delay={Math.min(i * 0.04, 0.24)} className="h-full">
              <TiltCard
                intensity={wide ? 2.5 : 5}
                // min-height only for multi-row cards: a single-row (banner) card's
                // grid track is exactly 190px, and forcing a taller min-height here
                // than that track made the card overflow into — and visually overlap
                // — the row directly below it.
                className={`h-full overflow-hidden rounded-2xl border ${span.row > 1 ? "min-h-[260px]" : ""}`}
                style={{ borderColor: "var(--line)" }}
              >
                <Link
                  href={`/project/${project.slug}`}
                  data-cursor="View project"
                  data-physics
                  className="group relative flex h-full min-w-0 flex-col justify-end p-5"
                  style={{ background: "var(--bg-raised)" }}
                >
                  <div className="absolute inset-0">
                    {project.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.cover}
                        alt=""
                        className="h-full w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
                      />
                    ) : (
                      <Pictogram
                        seedText={project.slug}
                        dotRadius={DOT_RADIUS[span.kind]}
                        complexity={COMPLEXITY[span.kind]}
                        hoverStroke={span.hoverStroke}
                        className="h-full w-full p-8"
                      />
                    )}
                  </div>
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
                    style={{ background: "linear-gradient(to top, var(--bg-raised) 12%, transparent 100%)" }}
                  />

                  <div className="relative z-10 min-w-0">
                    <div className="flex min-w-0 items-start justify-between gap-4">
                      <h3 className={`min-w-0 truncate ${wide ? "text-xl font-medium" : "text-lg font-medium"}`}>
                        {project.name}
                      </h3>
                      <span
                        className="mt-1 shrink-0 font-mono text-xs opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ color: "var(--accent-robotics)" }}
                      >
                        →
                      </span>
                    </div>
                    {(project.descKo || project.descEn) && (
                      <p
                        className={`mt-1 min-w-0 text-sm ${span.row === 1 ? "line-clamp-1" : "line-clamp-2"}`}
                        style={{ color: "var(--fg-3)" }}
                      >
                        {project.descKo || project.descEn}
                      </p>
                    )}

                    {span.row > 1 && project.tags.length > 0 && (
                      <div className="mt-3 flex min-w-0 flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="min-w-0 max-w-[9rem] shrink-0 truncate rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em]"
                            style={{ borderColor: "var(--line-strong)", color: "var(--fg-3)", background: "var(--bg-raised)" }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </TiltCard>
            </Reveal>
          </div>
        );
      })}
    </div>
  );
}
