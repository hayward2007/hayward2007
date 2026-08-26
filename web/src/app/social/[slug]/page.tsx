import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getBlogPostBySlug } from "@/lib/data";
import { getServerDict } from "@/lib/locale-server";
import { Reveal } from "@/components/reveal";
import { CommentForm } from "@/components/comment-form";
import { TagPill } from "@/components/tag-pill";
import { stripHtml } from "@/lib/html";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Post" };
  const description = stripHtml(post.body).slice(0, 160) || undefined;
  return { title: post.title, description };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, { dict, locale }] = await Promise.all([getBlogPostBySlug(slug), getServerDict()]);
  if (!post) notFound();

  const dateLocale = locale === "ko" ? "ko-KR" : "en-US";
  const compactTitle = post.title.length > 58;

  return (
    <main className="py-20 md:py-28">
      <div className="wrap max-w-xl">
        <Reveal>
          <Link href="/social" data-cursor="true" className="type-nav inline-flex items-center gap-2 text-xs" style={{ color: "var(--fg-3)" }}>
            <ArrowLeft aria-hidden="true" size={14} strokeWidth={1.8} />
            {dict.social.backToSocial}
          </Link>
          <h1
            className={
              compactTitle
                ? "font-display-expanded mt-5 text-[26px] leading-none md:text-4xl"
                : "type-tool-title mt-5"
            }
            style={compactTitle ? { fontStretch: "112.5%" } : undefined}
          >
            {post.title}
          </h1>
          <p className="type-index mt-3 text-sm" style={{ color: "var(--fg-3)" }}>
            {new Date(post.createdAt).toLocaleDateString(dateLocale)}
          </p>
          {post.source && (
            <p className="type-label mt-3" style={{ color: "var(--accent-robotics)" }}>
              {post.sourceUrl ? (
                <a href={post.sourceUrl} data-cursor="true" target="_blank" rel="noreferrer">
                  <span className="inline-flex items-center gap-1.5">
                    Curated from {post.source}
                    <ArrowUpRight aria-hidden="true" size={13} strokeWidth={1.8} />
                  </span>
                </a>
              ) : (
                <>Curated from {post.source}</>
              )}
            </p>
          )}
          {(post.field || post.tags.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.field && <TagPill tag={post.field} />}
              {post.tags.map((tag) => (
                <TagPill key={tag} tag={tag} />
              ))}
            </div>
          )}
        </Reveal>

        <Reveal delay={0.06} className="mt-10">
          <div
            className="rich-content space-y-4 text-lg leading-relaxed [&_blockquote]:border-l [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
            style={{ color: "var(--fg-2)" }}
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-16 border-t pt-10" style={{ borderColor: "var(--line)" }}>
            <CommentForm
              slug={post.slug}
              initialComments={post.comments}
              dateLocale={dateLocale}
              labels={{
                title: dict.social.commentsTitle,
                empty: dict.social.commentEmpty,
                namePlaceholder: dict.social.namePlaceholder,
                bodyPlaceholder: dict.social.bodyPlaceholder,
                submit: dict.social.submit,
                submitting: dict.social.submitting,
                error: dict.social.commentError,
                rateLimited: dict.social.commentRateLimited,
              }}
            />
          </div>
        </Reveal>
      </div>
    </main>
  );
}
