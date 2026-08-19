"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TagPill } from "@/components/tag-pill";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  createdAt: string;
  source: string;
  field: string;
  tags: string[];
};

export function BlogList({
  posts,
  dateLocale,
  allLabel = "All",
}: {
  posts: Post[];
  dateLocale: string;
  allLabel?: string;
}) {
  const [filter, setFilter] = useState<string | null>(null);

  const tags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [posts]);

  const filtered = filter ? posts.filter((p) => p.tags.includes(filter)) : posts;

  return (
    <div>
      {tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter(null)}
            className="rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.05em] transition-colors duration-150"
            style={{
              borderColor: "var(--line-strong)",
              background: filter === null ? "var(--fg)" : "transparent",
              color: filter === null ? "var(--bg)" : "var(--fg-3)",
            }}
          >
            {allLabel}
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setFilter(tag)}
              className="rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.05em] transition-colors duration-150"
              style={{
                borderColor: "var(--line-strong)",
                background: filter === tag ? "var(--fg)" : "transparent",
                color: filter === tag ? "var(--bg)" : "var(--fg-3)",
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-5">
        {filtered.map((post) => (
          <Link
            key={post.slug}
            href={`/social/${post.slug}`}
            data-cursor="true"
            className="group block border-t pt-5 first:border-t-0 first:pt-0"
            style={{ borderColor: "var(--line)" }}
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-lg font-medium">{post.title}</h2>
              <span className="shrink-0 font-mono text-xs" style={{ color: "var(--fg-3)" }}>
                {new Date(post.createdAt).toLocaleDateString(dateLocale)}
              </span>
            </div>
            {post.source && (
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.06em]" style={{ color: "var(--accent-robotics)" }}>
                Curated from {post.source}
              </p>
            )}
            {(post.field || post.tags.length > 0) && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {post.field && <TagPill tag={post.field} />}
                {post.tags.map((tag) => (
                  <TagPill key={tag} tag={tag} />
                ))}
              </div>
            )}
            {post.excerpt && (
              <p className="mt-1 line-clamp-2 text-sm" style={{ color: "var(--fg-3)" }}>
                {post.excerpt}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
