"use client";

import { useState } from "react";

export function ResumeExportTool() {
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function generate() {
    const clean = slug.trim().replace(/^\/?(p\/)?/, "");
    if (!clean) return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`/api/portfolio/${clean}`);
      if (!res.ok) throw new Error("No portfolio found at that link.");
      const { portfolio } = await res.json();

      const { buildResumePdf } = await import("@/lib/pdf-resume");
      const bytes = await buildResumePdf(portfolio);
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${clean}-resume.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <label className="block text-xs font-medium">Portfolio link or slug</label>
      <input
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="e.g. oh-gym-rl-internship or hayward.kim/p/oh-gym-rl-internship"
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: "var(--line-strong)" }}
      />
      <p className="text-xs" style={{ color: "var(--fg-4)" }}>
        Renders the English portions of the portfolio (Latin-only PDF fonts) — build the portfolio in
        /admin first, then paste its slug here.
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="button"
        onClick={generate}
        disabled={status === "loading" || !slug.trim()}
        className="rounded-lg px-4 py-2 text-sm font-medium"
        style={{ background: "var(--fg)", color: "var(--bg)" }}
      >
        {status === "loading" ? "Generating…" : "Generate PDF"}
      </button>
    </div>
  );
}
