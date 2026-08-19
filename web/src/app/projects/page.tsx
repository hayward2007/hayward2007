import { getPublicProjects } from "@/lib/data";
import { getServerDict } from "@/lib/locale-server";
import { ProjectGrid } from "@/components/project-grid";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getPublicProjects();
  const { dict } = await getServerDict();

  const goldCount = projects.filter((p) => p.awards.some((a) => a.rank === "gold")).length;

  return (
    <main className="py-20 md:py-28">
      <div className="wrap mb-6">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-robotics)" }}>
            {dict.projects.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{dict.projects.title}</h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
            {dict.projects.intro}
          </p>
        </Reveal>
      </div>

      <div className="wrap mb-12 flex items-center gap-8 border-t pt-6" style={{ borderColor: "var(--line)" }}>
        <div>
          <p className="text-2xl font-semibold tabular-nums">{projects.length}</p>
          <p className="text-sm" style={{ color: "var(--fg-3)" }}>
            {dict.projects.shown}
          </p>
        </div>
        {goldCount > 0 && (
          <div>
            <p className="text-2xl font-semibold tabular-nums">{goldCount}</p>
            <p className="text-sm" style={{ color: "var(--fg-3)" }}>
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
