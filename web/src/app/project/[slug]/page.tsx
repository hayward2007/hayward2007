import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug, getPublicProjects } from "@/lib/data";
import { getServerDict } from "@/lib/locale-server";
import { Pictogram } from "@/components/pictogram";
import { Reveal } from "@/components/reveal";
import { Magnetic } from "@/components/magnetic";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const projects = await getPublicProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, { locale, dict }] = await Promise.all([getProjectBySlug(slug), getServerDict()]);
  if (!project) notFound();

  const primaryDesc = locale === "ko" ? project.descKo || project.descEn : project.descEn || project.descKo;

  return (
    <main style={{ background: "var(--bg-inverted)", color: "var(--fg-inverted)" }}>
      <section className="relative flex min-h-[80vh] flex-col justify-end overflow-hidden pb-16 pt-32">
        {project.cover ? (
          <div className="pointer-events-none absolute inset-0 opacity-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.cover} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="pointer-events-none absolute right-[-6%] top-[-6%] h-[min(55vh,480px)] w-[min(55vh,480px)] opacity-25">
            <Pictogram seedText={project.slug} dotRadius={0.9} className="h-full w-full" stroke="var(--fg-inverted)" />
          </div>
        )}
        <div className="wrap relative z-10">
          <Link
            href="/projects"
            className="font-mono text-xs uppercase tracking-[0.1em]"
            style={{ color: "color-mix(in srgb, var(--fg-inverted) 60%, transparent)" }}
          >
            {dict.common.backToProjects}
          </Link>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.4rem,7vw,5.5rem)] font-semibold leading-[1.02] tracking-tight">
            {project.name}
          </h1>
          {project.awards.length > 0 && (
            <p
              className="mt-6 font-mono text-sm uppercase tracking-[0.06em]"
              style={{ color: "color-mix(in srgb, var(--fg-inverted) 70%, transparent)" }}
            >
              {project.awards[0].rankLabel} · {project.awards[0].name}
            </p>
          )}
        </div>
      </section>

      <section className="py-24" style={{ background: "var(--bg)", color: "var(--fg)" }}>
        <div className="wrap grid grid-cols-1 gap-16 md:grid-cols-[0.35fr_0.65fr]">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-robotics)" }}>
              {dict.common.story}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            {primaryDesc ? (
              <div
                className="space-y-4 text-lg leading-relaxed [&_blockquote]:border-l [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                style={{ color: "var(--fg-2)", borderColor: "var(--line)" }}
                dangerouslySetInnerHTML={{ __html: primaryDesc }}
              />
            ) : (
              <p className="text-lg leading-relaxed" style={{ color: "var(--fg-2)" }}>
                {dict.common.noWriteupYet}
              </p>
            )}
          </Reveal>
        </div>

        {project.awards.length > 0 && (
          <div className="wrap mt-20 grid grid-cols-1 gap-16 border-t pt-20 md:grid-cols-[0.35fr_0.65fr]" style={{ borderColor: "var(--line)" }}>
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-signal)" }}>
                {dict.common.recognition}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="space-y-4">
                {project.awards.map((award, i) => (
                  <div key={i} className="flex items-center justify-between border-b py-4" style={{ borderColor: "var(--line)" }}>
                    <div>
                      <p className="font-medium">{award.name}</p>
                      <p className="text-sm" style={{ color: "var(--fg-3)" }}>
                        {award.rankLabel}
                      </p>
                    </div>
                    <span className="font-mono text-xs" style={{ color: "var(--fg-3)" }}>
                      {award.year}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        )}
      </section>

      <section className="py-24 text-center" style={{ background: "var(--bg-inverted)", color: "var(--fg-inverted)" }}>
        <div className="wrap flex flex-col items-center gap-6">
          <p className="max-w-lg text-xl">{dict.common.wantWriteup}</p>
          <Magnetic strength={0.3}>
            <a
              href="mailto:hayward_kim@korea.ac.kr"
              className="inline-flex h-12 items-center rounded-full px-6 text-sm font-medium"
              style={{ background: "var(--fg-inverted)", color: "var(--bg-inverted)" }}
            >
              {dict.common.askDirectly}
            </a>
          </Magnetic>
        </div>
      </section>
    </main>
  );
}
