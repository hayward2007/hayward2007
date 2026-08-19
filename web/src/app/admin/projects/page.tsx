"use client";

import { useEffect, useState } from "react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

type Award = { competition: { name: string; rankLabel: string | null } };
type Project = {
  id: string;
  name: string;
  slug: string;
  descKo: string | null;
  descEn: string | null;
  visibility: string;
  order: number;
  awards: Award[];
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/projects")
      .then((r) => r.json())
      .then((data) => setProjects(data.projects));
  }, []);

  async function save(id: string, patch: Partial<Project>) {
    setSaving(true);
    const res = await fetch(`/api/admin/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setProjects((prev) => prev?.map((p) => (p.id === id ? { ...p, ...data.project } : p)) ?? prev);
    }
  }

  if (!projects) return <p style={{ color: "var(--fg-3)" }}>Loading…</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Projects</h1>
      <p className="text-sm" style={{ color: "var(--fg-3)" }}>
        Edited here, not written back to Notion. Re-syncing from Notion overwrites name/description/cover but keeps
        the slug.
      </p>

      <div className="divide-y" style={{ borderColor: "var(--line)" }}>
        {projects.map((project) => (
          <div key={project.id} className="py-4">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setOpenId(openId === project.id ? null : project.id)}
            >
              <div>
                <p className="font-medium">{project.name}</p>
                <p className="text-xs" style={{ color: "var(--fg-3)" }}>
                  /project/{project.slug} · {project.visibility}
                  {project.awards.length > 0 && ` · ${project.awards.length} award(s)`}
                </p>
              </div>
              <span style={{ color: "var(--fg-3)" }}>{openId === project.id ? "−" : "+"}</span>
            </button>

            {openId === project.id && (
              <div className="mt-4 space-y-3 rounded-xl border p-4" style={{ borderColor: "var(--line)" }}>
                <label className="block text-xs font-medium">Slug</label>
                <input
                  defaultValue={project.slug}
                  onBlur={(e) => save(project.id, { slug: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--line-strong)" }}
                />

                <label className="block text-xs font-medium">Description (KR)</label>
                <RichTextEditor
                  key={`${project.id}-ko`}
                  value={project.descKo ?? ""}
                  onSave={(html) => save(project.id, { descKo: html })}
                  placeholder="Write the Korean description…"
                />

                <label className="block text-xs font-medium">Description (EN)</label>
                <RichTextEditor
                  key={`${project.id}-en`}
                  value={project.descEn ?? ""}
                  onSave={(html) => save(project.id, { descEn: html })}
                  placeholder="Write the English description…"
                />

                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium">Visibility</label>
                  <select
                    defaultValue={project.visibility}
                    onChange={(e) => save(project.id, { visibility: e.target.value })}
                    className="rounded-lg border px-3 py-1.5 text-sm"
                    style={{ borderColor: "var(--line-strong)" }}
                  >
                    <option value="public">public</option>
                    <option value="private">private</option>
                  </select>
                  {saving && <span className="text-xs" style={{ color: "var(--fg-3)" }}>Saving…</span>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
