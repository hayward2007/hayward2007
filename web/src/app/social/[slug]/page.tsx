import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPostBySlug } from "@/lib/data";
import { getServerDict } from "@/lib/locale-server";
import { Reveal } from "@/components/reveal";
import { CommentForm } from "@/components/comment-form";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, { dict, locale }] = await Promise.all([getBlogPostBySlug(slug), getServerDict()]);
  if (!post) notFound();

  const dateLocale = locale === "ko" ? "ko-KR" : "en-US";

  return (
    <main className="py-20 md:py-28">
      <div className="wrap max-w-xl">
        <Reveal>
          <Link href="/social" data-cursor="true" className="font-mono text-xs uppercase tracking-[0.1em]" style={{ color: "var(--fg-3)" }}>
            {dict.social.backToSocial}
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{post.title}</h1>
          <p className="mt-2 font-mono text-xs" style={{ color: "var(--fg-3)" }}>
            {new Date(post.createdAt).toLocaleDateString(dateLocale)}
          </p>
        </Reveal>

        <Reveal delay={0.06} className="mt-10">
          <div
            className="space-y-4 text-lg leading-relaxed [&_blockquote]:border-l [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
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
              }}
            />
          </div>
        </Reveal>
      </div>
    </main>
  );
}
