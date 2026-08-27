import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Download, Eye } from "lucide-react";
import { getServerDict } from "@/lib/locale-server";
import { Reveal } from "@/components/reveal";
import { PortfolioIndexNav } from "@/components/portfolio-index-nav";
import { ProfileInfoTable } from "@/components/portfolio-contact-reveal";
import { SkillTag } from "@/components/skill-tag";
import { SKILL_CATEGORIES } from "@/lib/skills";

export const metadata: Metadata = { title: "Résumé" };

// Static file sizes for the PDFs under public/portfolio/ — informational
// only, not translated content, so kept here rather than in i18n.ts.
const APPENDIX_SIZES: Record<string, string> = {
  portfolio: "11.1 MB",
  a: "0.8 MB",
  b: "190.7 MB",
  c: "52.4 MB",
  d: "11.4 MB",
};
const DOWNLOAD_ALL_HREF = "/portfolio/portfolio-all.zip";
const DOWNLOAD_ALL_SIZE = "266.4 MB";

// Brand icon path/hex for the tech-stack items that have one, reused from
// the Skills section's own data so both places agree on the same logos.
const ICON_BY_NAME = new Map(SKILL_CATEGORIES.flatMap((category) => category.items).map((item) => [item.name, item]));

export default async function PortfolioDocPage() {
  const { dict } = await getServerDict();
  const p = dict.portfolio;

  const navItems = [
    { id: "profile", num: "01", label: p.infoTitle },
    { id: "projects", num: "02", label: p.projectsTitle },
    { id: "appendix", num: "03", label: p.appendixTitle },
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
          <header className="flex flex-col gap-4 pb-8 md:pb-10">
            <Reveal>
              <p className="type-page-kicker" style={{ color: "var(--accent)" }}>
                {p.eyebrow}
              </p>
              <h1 className="font-display-expanded mt-3 text-4xl leading-[0.94] md:text-[56px]">{p.docTitle}</h1>
              <p className="type-page-lede mt-2 font-semibold" style={{ color: "var(--fg-2)" }}>
                {p.name}
              </p>
            </Reveal>
            <div
              className="mt-2 flex items-center px-4 py-3 md:px-6"
              style={{ background: "var(--bg-inverted)", color: "var(--fg-inverted)" }}
            >
              <p className="font-display text-[15px] font-semibold md:text-base">{p.motto}</p>
            </div>
          </header>

          <section id="profile" className="scroll-mt-20 border-t py-10 md:py-12" style={{ borderColor: "var(--line)" }}>
            <div className="grid grid-cols-[104px_minmax(0,1fr)] items-start gap-6 md:grid-cols-[minmax(0,1fr)_132px] md:gap-10">
              <Reveal className="order-2 md:order-1">
                <div className="space-y-4">
                  {p.bio.map((paragraph) => (
                    <p key={paragraph} className="text-[15px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Reveal>
              <figure
                className="order-1 aspect-[413/531] w-[104px] shrink-0 overflow-hidden rounded-md border md:order-2 md:w-[132px]"
                style={{ background: "var(--bg-raised)", borderColor: "var(--line-strong)" }}
              >
                <Image
                  src="/assets/profile-figma.jpeg"
                  alt="Hayward Kim"
                  width={413}
                  height={531}
                  className="h-full w-full object-cover"
                />
              </figure>
            </div>

            <div className="mt-8 border-t pt-6" style={{ borderColor: "var(--line)" }}>
              <p className="type-label" style={{ color: "var(--fg-3)" }}>
                {p.techStackTitle}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                {p.techStack.map((name) => {
                  const icon = ICON_BY_NAME.get(name);
                  return <SkillTag key={name} name={name} path={icon?.path} hex={icon?.hex} primary />;
                })}
              </div>
            </div>

            <div className="mt-8 border-t pt-6" style={{ borderColor: "var(--line)" }}>
              <p className="type-label" style={{ color: "var(--fg-3)" }}>
                {p.highlightsTitle}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.highlights.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border px-3 py-1.5 text-sm font-medium"
                    style={{ borderColor: "var(--line-strong)", color: "var(--fg)" }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t pt-6" style={{ borderColor: "var(--line)" }}>
              <p className="type-label" style={{ color: "var(--fg-3)" }}>
                {p.infoTitle}
              </p>
              <div className="mt-4">
                <ProfileInfoTable rows={p.info} copy={p.protectedInfo} />
              </div>
            </div>

            <p className="mt-8 text-sm" style={{ color: "var(--fg-3)" }}>
              {p.appendixNote}
            </p>
          </section>

          <section id="projects" className="scroll-mt-20 border-t py-10 md:py-12" style={{ borderColor: "var(--line)" }}>
            <p className="type-label mb-6" style={{ color: "var(--fg-3)" }}>
              {p.projectsTitle}
            </p>
            <ul className="flex flex-col">
              {p.projects.map((project) => (
                <li key={project.slug} className="border-t py-5 first:border-t-0 first:pt-0" style={{ borderColor: "var(--line)" }}>
                  <Link href={`/project/${project.slug}`} data-cursor="View project" className="group flex items-baseline justify-between gap-4">
                    <span className="min-w-0">
                      <span className="font-display block text-lg font-bold">{project.name}</span>
                      <span className="mt-1 block text-sm" style={{ color: "var(--fg-2)" }}>
                        {project.tagline}
                      </span>
                    </span>
                    <span
                      className="type-label shrink-0 border-b pb-0.5 opacity-70 transition-opacity group-hover:opacity-100"
                      style={{ color: "var(--accent)", borderColor: "var(--accent)" }}
                    >
                      {p.readMore}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section id="appendix" className="scroll-mt-20 border-t py-10 md:py-12" style={{ borderColor: "var(--line)" }}>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="type-label" style={{ color: "var(--fg-3)" }}>
                  {p.appendixTitle}
                </p>
                <p className="mt-2 max-w-[520px] text-sm leading-6" style={{ color: "var(--fg-2)" }}>
                  {p.appendixIntro}
                </p>
              </div>
              <a
                href={DOWNLOAD_ALL_HREF}
                download
                data-cursor="true"
                className="inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{ background: "var(--fg)", color: "var(--bg)" }}
              >
                <Download aria-hidden="true" size={16} strokeWidth={2} />
                {p.downloadAll}
                <span className="opacity-60">· {DOWNLOAD_ALL_SIZE}</span>
              </a>
            </div>

            <ul className="flex flex-col">
              {p.appendices.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 border-t py-5 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-3">
                      <span className="type-index text-xs tabular-nums" style={{ color: "var(--accent)" }}>
                        {item.label}
                      </span>
                      <span className="font-display text-base font-bold">{item.title}</span>
                    </div>
                    <p className="mt-1 max-w-[480px] text-sm" style={{ color: "var(--fg-3)" }}>
                      {item.description}
                    </p>
                    <p className="type-index mt-1 text-xs" style={{ color: "var(--fg-4)" }}>
                      {item.pages} · {APPENDIX_SIZES[item.id]}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={item.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="true"
                      className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium"
                      style={{ borderColor: "var(--line-strong)", color: "var(--fg-2)" }}
                    >
                      <Eye aria-hidden="true" size={14} strokeWidth={1.8} />
                      {p.view}
                    </a>
                    <a
                      href={item.file}
                      download
                      data-cursor="true"
                      className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium"
                      style={{ borderColor: "var(--line-strong)", color: "var(--fg-2)" }}
                    >
                      <Download aria-hidden="true" size={14} strokeWidth={1.8} />
                      {p.download}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <footer className="wrap mt-10 pt-8" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="text-xs" style={{ color: "var(--fg-4)" }}>
          <span>© {new Date().getFullYear()} Hayward Kim</span>
        </div>
      </footer>
    </main>
  );
}
