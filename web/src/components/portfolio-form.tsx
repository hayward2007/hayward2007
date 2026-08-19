"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ProjectOption = {
  id: string;
  name: string;
  awards: { competition: { rankLabel: string | null } }[];
};

type PortfolioInitial = {
  id: string;
  slug: string;
  title: string;
  targetRole: string;
  targetOrg: string;
  intro: string;
  accent: string;
  isPublished: boolean;
  selectedProjectIds: string[];
};

const ACCENTS = [
  { value: "teal", label: "Robotics teal" },
  { value: "violet", label: "Physical-AI violet" },
  { value: "signal", label: "Signal orange" },
];

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "hayward.kim";

export function PortfolioForm({
  projects,
  initial,
}: {
  projects: ProjectOption[];
  initial?: PortfolioInitial;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [targetOrg, setTargetOrg] = useState(initial?.targetOrg ?? "");
  const [targetRole, setTargetRole] = useState(initial?.targetRole ?? "");
  const [intro, setIntro] = useState(initial?.intro ?? "");
  const [accent, setAccent] = useState(initial?.accent ?? "teal");
  const [selected, setSelected] = useState<string[]>(initial?.selectedProjectIds ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedSlug, setSavedSlug] = useState(initial?.slug ?? "");

  const shareUrl = useMemo(() => (savedSlug ? `/p/${savedSlug}` : ""), [savedSlug]);
  const subdomainUrl = useMemo(
    () => (savedSlug ? `https://${savedSlug}.${BASE_DOMAIN}` : ""),
    [savedSlug],
  );

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || selected.length === 0) {
      setError("Give it a title and pick at least one project.");
      return;
    }
    setSaving(true);
    setError("");

    const payload = { title, targetOrg, targetRole, intro, accent, projectIds: selected };
    const res = initial
      ? await fetch(`/api/admin/portfolios/${initial.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/portfolios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong.");
      return;
    }
    const data = await res.json();
    setSavedSlug(data.portfolio.slug);
    if (!initial) router.push(`/admin/portfolios/${data.portfolio.id}`);
    else router.refresh();
  }

  async function onDelete() {
    if (!initial) return;
    if (!confirm("Delete this portfolio build? This cannot be undone.")) return;
    await fetch(`/api/admin/portfolios/${initial.id}`, { method: "DELETE" });
    router.push("/admin/portfolios");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium">Title (internal)</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='e.g. "OH! Gym — RL Internship Application"'
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--line-strong)" }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium">Target organization</label>
          <input
            value={targetOrg}
            onChange={(e) => setTargetOrg(e.target.value)}
            placeholder="OH! Gym"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--line-strong)" }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium">Target role</label>
          <input
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Robotics RL Intern"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--line-strong)" }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium">Accent</label>
          <select
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--line-strong)" }}
          >
            {ACCENTS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium">Intro blurb (shown at top of the shared page)</label>
        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={3}
          placeholder="A short note on why these projects fit this application."
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: "var(--line-strong)" }}
        />
      </div>

      <div>
        <label className="block text-xs font-medium">Projects to include</label>
        <div className="mt-2 divide-y rounded-xl border" style={{ borderColor: "var(--line)" }}>
          {projects.map((project) => (
            <label key={project.id} className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm">
              <input type="checkbox" checked={selected.includes(project.id)} onChange={() => toggle(project.id)} />
              <span className="flex-1">{project.name}</span>
              {project.awards.length > 0 && (
                <span className="text-xs" style={{ color: "var(--fg-3)" }}>
                  {project.awards.map((a) => a.competition.rankLabel).filter(Boolean).join(", ")}
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg px-4 py-2 text-sm font-medium"
          style={{ background: "var(--fg)", color: "var(--bg)" }}
        >
          {saving ? "Saving…" : initial ? "Save changes" : "Create portfolio"}
        </button>
        {initial && (
          <button type="button" onClick={onDelete} className="text-sm text-red-500">
            Delete
          </button>
        )}
      </div>

      {savedSlug && (
        <div className="rounded-xl border p-4 text-sm" style={{ borderColor: "var(--line)" }}>
          <p className="font-medium">Shareable links</p>
          <p className="mt-2">
            Works immediately: <a href={shareUrl} className="underline" style={{ color: "var(--accent-robotics)" }}>{shareUrl}</a>
          </p>
          <p className="mt-1">
            Once you point <code>*.{BASE_DOMAIN}</code> DNS at this server: <span style={{ color: "var(--fg-3)" }}>{subdomainUrl}</span>
          </p>
        </div>
      )}
    </form>
  );
}
