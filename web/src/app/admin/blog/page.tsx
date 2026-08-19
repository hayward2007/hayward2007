"use client";

import { useEffect, useState } from "react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

type Post = {
  id: string;
  title: string;
  slug: string;
  body: string;
  published: boolean;
  _count: { comments: number };
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then((data) => setPosts(data.posts));
  }, []);

  async function save(id: string, patch: Partial<Post>) {
    setSaving(true);
    const res = await fetch(`/api/admin/blog/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setPosts((prev) => prev?.map((p) => (p.id === id ? { ...p, ...data.post } : p)) ?? prev);
    }
  }

  async function createPost(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    const res = await fetch("/api/admin/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() }),
    });
    setCreating(false);
    if (res.ok) {
      const data = await res.json();
      setPosts((prev) => [{ ...data.post, _count: { comments: 0 } }, ...(prev ?? [])]);
      setNewTitle("");
      setOpenId(data.post.id);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this post and all its comments?")) return;
    const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    if (res.ok) setPosts((prev) => prev?.filter((p) => p.id !== id) ?? prev);
  }

  if (!posts) return <p style={{ color: "var(--fg-3)" }}>Loading…</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Blog</h1>
      <p className="text-sm" style={{ color: "var(--fg-3)" }}>
        Posts show on /social once published. Comments are public and go live immediately — no approval step.
      </p>

      <form onSubmit={createPost} className="flex gap-3">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New post title…"
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: "var(--line-strong)" }}
        />
        <button
          type="submit"
          disabled={creating}
          className="rounded-lg px-4 py-2 text-sm font-medium"
          style={{ background: "var(--fg)", color: "var(--bg)" }}
        >
          {creating ? "Creating…" : "New post"}
        </button>
      </form>

      <div className="divide-y" style={{ borderColor: "var(--line)" }}>
        {posts.map((post) => (
          <div key={post.id} className="py-4">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setOpenId(openId === post.id ? null : post.id)}
            >
              <div>
                <p className="font-medium">{post.title}</p>
                <p className="text-xs" style={{ color: "var(--fg-3)" }}>
                  /social/{post.slug} · {post.published ? "published" : "draft"} · {post._count.comments} comment
                  {post._count.comments === 1 ? "" : "s"}
                </p>
              </div>
              <span style={{ color: "var(--fg-3)" }}>{openId === post.id ? "−" : "+"}</span>
            </button>

            {openId === post.id && (
              <div className="mt-4 space-y-3 rounded-xl border p-4" style={{ borderColor: "var(--line)" }}>
                <label className="block text-xs font-medium">Title</label>
                <input
                  defaultValue={post.title}
                  onBlur={(e) => save(post.id, { title: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--line-strong)" }}
                />

                <label className="block text-xs font-medium">Slug</label>
                <input
                  defaultValue={post.slug}
                  onBlur={(e) => save(post.id, { slug: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--line-strong)" }}
                />

                <label className="block text-xs font-medium">Body</label>
                <RichTextEditor
                  key={post.id}
                  value={post.body}
                  onSave={(html) => save(post.id, { body: html })}
                  placeholder="Write the post…"
                />

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium">
                    <input
                      type="checkbox"
                      defaultChecked={post.published}
                      onChange={(e) => save(post.id, { published: e.target.checked })}
                    />
                    Published
                  </label>
                  {saving && <span className="text-xs" style={{ color: "var(--fg-3)" }}>Saving…</span>}
                  <button
                    type="button"
                    onClick={() => remove(post.id)}
                    className="ml-auto text-xs"
                    style={{ color: "var(--accent-signal)" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
