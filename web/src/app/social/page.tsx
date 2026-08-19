import { Reveal } from "@/components/reveal";
import { CopyRow } from "@/components/copy-row";
import { HeroDiagram } from "@/components/hero-diagram";
import { BlogList } from "@/components/blog-list";
import { getServerDict } from "@/lib/locale-server";
import { getPublishedBlogPosts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SocialPage() {
  const [{ dict, locale }, posts] = await Promise.all([getServerDict(), getPublishedBlogPosts()]);
  const dateLocale = locale === "ko" ? "ko-KR" : "en-US";

  return (
    <main className="relative overflow-hidden py-20 md:py-28">
      <HeroDiagram />
      <div className="wrap relative z-10 max-w-xl">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-robotics)" }}>
            {dict.contact.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{dict.contact.title}</h1>
          <p className="mt-4 text-lg" style={{ color: "var(--fg-2)" }}>
            {dict.contact.intro}
          </p>
        </Reveal>

        <Reveal delay={0.06} className="mt-12">
          <CopyRow label={dict.contact.email} value="hayward_kim@korea.ac.kr" href="mailto:hayward_kim@korea.ac.kr" />
          <CopyRow label={dict.contact.portfolio} value="hayward.kim" href="https://hayward.kim" />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-16 border-t pt-10" style={{ borderColor: "var(--line)" }}>
            <p className="font-mono text-xs uppercase tracking-[0.1em]" style={{ color: "var(--accent-signal)" }}>
              {dict.social.blogTitle}
            </p>
            {posts.length === 0 ? (
              <p className="mt-4 text-sm" style={{ color: "var(--fg-3)" }}>
                {dict.social.noPosts}
              </p>
            ) : (
              <div className="mt-4">
                <BlogList posts={posts} dateLocale={dateLocale} allLabel={dict.social.allTags} />
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </main>
  );
}
