"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";

type Comment = { id: string; name: string; body: string; createdAt: string };

export function CommentForm({
  slug,
  initialComments,
  labels,
  dateLocale,
}: {
  slug: string;
  initialComments: Comment[];
  labels: {
    title: string;
    empty: string;
    namePlaceholder: string;
    bodyPlaceholder: string;
    submit: string;
    submitting: string;
    error: string;
    rateLimited: string;
  };
  dateLocale: string;
}) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/blog/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, body, website }),
      });
      if (!res.ok) {
        setError(res.status === 429 ? labels.rateLimited : labels.error);
        return;
      }
      const data = await res.json();
      if (!data.comment) return;
      setComments((prev) => [...prev, data.comment]);
      setBody("");
    } catch {
      setError(labels.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <p className="type-page-kicker flex items-center gap-2" style={{ color: "var(--accent-signal)" }}>
        <MessageCircle aria-hidden="true" size={14} strokeWidth={1.8} />
        {labels.title} ({comments.length})
      </p>

      <div className="mt-5 space-y-5">
        {comments.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--fg-3)" }}>
            {labels.empty}
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="border-t pt-4 first:border-t-0 first:pt-0" style={{ borderColor: "var(--line)" }}>
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-display text-sm font-semibold">{c.name}</p>
                <span className="type-index shrink-0 text-sm" style={{ color: "var(--fg-3)" }}>
                  {new Date(c.createdAt).toLocaleDateString(dateLocale)}
                </span>
              </div>
              <p className="mt-1 text-sm" style={{ color: "var(--fg-2)" }}>
                {c.body}
              </p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <label htmlFor="comment-name" className="sr-only">{labels.namePlaceholder}</label>
        <input
          id="comment-name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={labels.namePlaceholder}
          maxLength={60}
          required
          className="w-full rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: "var(--line-strong)", background: "var(--bg-raised)" }}
        />
        <label htmlFor="comment-body" className="sr-only">{labels.bodyPlaceholder}</label>
        <textarea
          id="comment-body"
          name="comment"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={labels.bodyPlaceholder}
          maxLength={1000}
          required
          rows={3}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: "var(--line-strong)", background: "var(--bg-raised)" }}
        />
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="comment-website">Website</label>
          <input
            id="comment-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>
        {error && <p role="alert" className="text-sm" style={{ color: "var(--accent-signal)" }}>{error}</p>}
        <button
          type="submit"
          disabled={submitting || !name.trim() || !body.trim()}
          className="type-nav inline-flex min-h-10 items-center gap-2 rounded-lg px-4 py-2 text-sm"
          style={{ background: "var(--fg)", color: "var(--bg)" }}
        >
          <Send aria-hidden="true" size={15} strokeWidth={1.8} />
          {submitting ? labels.submitting : labels.submit}
        </button>
      </form>
    </div>
  );
}
