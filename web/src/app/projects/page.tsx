import type { Metadata } from "next";
import { getPublicProjects } from "@/lib/data";
import { getServerDict } from "@/lib/locale-server";
import { ProjectGrid } from "@/components/project-grid";
import { Reveal } from "@/components/reveal";
import { CountUp } from "@/components/count-up";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const [projects, { dict }] = await Promise.all([getPublicProjects(), getServerDict()]);

  const goldCount = projects.filter((p) => p.awards.some((a) => a.rank === "gold")).length;

  return (
    <main className="py-16 md:py-24">
      <div className="wrap mb-10">
        <Reveal>
          <p className="type-page-kicker" style={{ color: "var(--accent-robotics)" }}>
            {dict.projects.eyebrow}
          </p>
          <h1 className="type-page-title mt-4 max-w-4xl">{dict.projects.title}</h1>
          <p className="type-page-lede mt-5" style={{ color: "var(--fg-2)" }}>
            {dict.projects.intro}
          </p>
        </Reveal>
      </div>

      <div className="wrap mb-12 flex items-center gap-12 border-y py-6" style={{ borderColor: "var(--line-strong)" }}>
        <div className="group cursor-default px-1 py-1 transition-colors duration-200">
          <p className="type-stat transition-colors duration-200 group-hover:text-[var(--accent-robotics)]">
            <CountUp value={projects.length} />
          </p>
          <p className="type-label mt-2" style={{ color: "var(--fg-3)" }}>
            {dict.projects.shown}
          </p>
        </div>
        {goldCount > 0 && (
          <div className="group cursor-default px-1 py-1 transition-colors duration-200">
            <p className="type-stat transition-colors duration-200 group-hover:text-[var(--accent-signal)]">
              <CountUp value={goldCount} />
            </p>
            <p className="type-label mt-2" style={{ color: "var(--fg-3)" }}>
              {dict.projects.goldRanked}
            </p>
          </div>
        )}
      </div>

      <div className="wrap">
        <ProjectGrid projects={projects} />
      </div>
    </main>
  );
}
