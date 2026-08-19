"use client";

import { useState } from "react";

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
  };
  dateLocale: string;
}) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return;
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/blog/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, body }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError("Couldn't post that comment — try again.");
      return;
    }
    const data = await res.json();
    setComments((prev) => [...prev, data.comment]);
    setBody("");
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.1em]" style={{ color: "var(--accent-signal)" }}>
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
                <p className="text-sm font-medium">{c.name}</p>
                <span className="shrink-0 font-mono text-xs" style={{ color: "var(--fg-3)" }}>
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
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={labels.namePlaceholder}
          maxLength={60}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: "var(--line-strong)", background: "var(--bg-raised)" }}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={labels.bodyPlaceholder}
          maxLength={1000}
          rows={3}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: "var(--line-strong)", background: "var(--bg-raised)" }}
        />
        {error && <p className="text-sm" style={{ color: "var(--accent-signal)" }}>{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg px-4 py-2 text-sm font-medium"
          style={{ background: "var(--fg)", color: "var(--bg)" }}
        >
          {submitting ? labels.submitting : labels.submit}
        </button>
      </form>
    </div>
  );
}
