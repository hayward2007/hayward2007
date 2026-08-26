import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { getProjectBySlug, getPublicProjects } from "@/lib/data";
import { getServerDict } from "@/lib/locale-server";
import { Pictogram } from "@/components/pictogram";
import { Reveal } from "@/components/reveal";
import { Magnetic } from "@/components/magnetic";
import { ProjectCaseStudyView } from "@/components/project-case-study";
import { getProjectCaseStudy, getProjectCaseStudySlugs } from "@/lib/project-case-studies";
import { stripHtml } from "@/lib/html";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = getProjectCaseStudy(slug);
  if (caseStudy) {
    return {
      title: caseStudy.name,
      description: caseStudy.description,
      openGraph: { images: [{ url: caseStudy.heroImage, alt: caseStudy.heroImageAlt }] },
    };
  }

  const project = await getProjectBySlug(slug);
  return project
    ? { title: project.name, description: stripHtml(project.descKo || project.descEn) || undefined }
    : { title: "Project" };
}

export async function generateStaticParams() {
  const projects = await getPublicProjects();
  return [...new Set([...projects.map((project) => project.slug), ...getProjectCaseStudySlugs()])].map((slug) => ({ slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, { locale, dict }] = await Promise.all([getProjectBySlug(slug), getServerDict()]);
  if (!project) notFound();
  const caseStudy = getProjectCaseStudy(slug);
  const caseAccent =
    caseStudy?.accent === "ai"
      ? "var(--accent-ai)"
      : caseStudy?.accent === "signal"
        ? "var(--accent-signal)"
        : "var(--accent-robotics)";

  // aiSummary (a local-LLM write-up built from the full Notion page body) is
  // the primary story once it exists; the short descKo/descEn property text
  // is only a fallback for projects that haven't been summarized yet.
  const primaryDesc =
    project.aiSummary || (locale === "ko" ? project.descKo || project.descEn : project.descEn || project.descKo);

  return (
    <main style={{ background: "var(--bg-inverted)", color: "var(--fg-inverted)" }}>
      <section className="relative flex min-h-[82vh] overflow-hidden pb-14 pt-28 md:pb-20 md:pt-36">
        <div className="wrap relative z-10 grid min-w-0 grid-cols-1 items-end gap-12 lg:grid-cols-[0.48fr_0.52fr] lg:gap-16">
          <div className="min-w-0">
            <Link
              href="/projects"
              className="type-nav text-xs"
              style={{ color: "color-mix(in srgb, var(--fg-inverted) 60%, transparent)" }}
            >
              {dict.common.backToProjects}
            </Link>
            {caseStudy && (
              <p className="type-page-kicker mt-10" style={{ color: caseAccent }}>
                {caseStudy.statusLabel}
              </p>
            )}
            <h1 className="type-project-title mt-5 max-w-4xl break-words">{project.name}</h1>
            {caseStudy && <p className="font-display mt-7 max-w-xl text-xl font-medium leading-8">{caseStudy.tagline}</p>}
            {project.awards.length > 0 && (
              <p
                className="type-label mt-6 text-sm"
                style={{ color: "color-mix(in srgb, var(--fg-inverted) 70%, transparent)" }}
              >
                {project.awards[0].rankLabel} · {project.awards[0].name}
              </p>
            )}
            {caseStudy?.repositoryUrl && (
              <a
                href={caseStudy.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="type-nav mt-8 inline-flex min-h-11 items-center gap-2 border-b text-sm transition-colors hover:[color:var(--accent-robotics)]"
                style={{ borderColor: "color-mix(in srgb, var(--fg-inverted) 36%, transparent)" }}
              >
                GitHub 저장소
                <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.8} />
              </a>
            )}
          </div>

          <div className="relative aspect-[4/3] min-h-[280px] w-full overflow-hidden lg:min-h-[460px]">
            {project.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={caseStudy?.heroImage || project.cover}
                alt={caseStudy?.heroImageAlt || `${project.name} project visual`}
                className={`absolute inset-0 h-full w-full ${caseStudy?.heroFit === "cover" ? "object-cover" : "object-contain"}`}
              />
            ) : (
              <Pictogram seedText={project.slug} dotRadius={0.9} className="h-full w-full opacity-40" stroke="var(--fg-inverted)" />
            )}
          </div>
        </div>
      </section>

      {caseStudy ? (
        <ProjectCaseStudyView study={caseStudy} />
      ) : (
        <section className="py-24" style={{ background: "var(--bg)", color: "var(--fg)" }}>
          <div className="wrap grid grid-cols-1 gap-16 md:grid-cols-[0.35fr_0.65fr]">
            <Reveal>
              <p className="type-page-kicker" style={{ color: "var(--accent-robotics)" }}>
                {dict.common.story}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              {primaryDesc ? (
                <div
                  className="rich-content space-y-4 text-lg leading-relaxed [&_blockquote]:border-l [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
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
                <p className="type-page-kicker" style={{ color: "var(--accent-signal)" }}>
                  {dict.common.recognition}
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="space-y-4">
                  {project.awards.map((award, i) => (
                    <div key={i} className="flex items-center justify-between border-b py-4" style={{ borderColor: "var(--line)" }}>
                      <div>
                        <p className="font-display font-semibold">{award.name}</p>
                        <p className="text-sm" style={{ color: "var(--fg-3)" }}>
                          {award.rankLabel}
                        </p>
                      </div>
                      <span className="type-index text-sm" style={{ color: "var(--fg-3)" }}>
                        {award.year}
                      </span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          )}
        </section>
      )}

      <section
        className="border-t py-24 text-center"
        style={{
          background: "var(--bg-inverted)",
          color: "var(--fg-inverted)",
          borderColor: "color-mix(in srgb, var(--fg-inverted) 12%, transparent)",
        }}
      >
        <div className="wrap flex flex-col items-center gap-6">
          <p className="font-display max-w-lg text-xl font-medium">{dict.common.wantWriteup}</p>
          <Magnetic strength={0.3}>
            <a
              href="mailto:hayward_kim@korea.ac.kr"
              className="type-nav inline-flex h-12 items-center gap-2 rounded-lg px-6 text-sm"
              style={{ background: "var(--fg-inverted)", color: "var(--bg-inverted)" }}
            >
              <Mail aria-hidden="true" size={16} strokeWidth={1.8} />
              {dict.common.askDirectly}
            </a>
          </Magnetic>
        </div>
      </section>
    </main>
  );
}
