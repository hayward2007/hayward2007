"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";

export function ResumeExportTool() {
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function generate() {
    const clean = normalizePortfolioSlug(slug);
    if (!clean) {
      setStatus("error");
      setError("Enter a valid portfolio slug or /p/ link.");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`/api/portfolio/${encodeURIComponent(clean)}`);
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
      <label htmlFor="resume-portfolio-slug" className="type-label block">Portfolio link or slug</label>
      <input
        id="resume-portfolio-slug"
        name="portfolio-slug"
        autoComplete="off"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="e.g. oh-gym-rl-internship or hayward.kim/p/oh-gym-rl-internship"
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: "var(--line-strong)" }}
      />
      <p className="text-xs" style={{ color: "var(--fg-4)" }}>
        Renders the English portions of the portfolio (Latin-only PDF fonts). Build the portfolio in
        /admin first, then paste its slug here.
      </p>
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      <button
        type="button"
        onClick={generate}
        disabled={status === "loading" || !slug.trim()}
        className="type-nav inline-flex min-h-10 items-center gap-2 rounded-lg px-4 py-2 text-sm"
        style={{ background: "var(--fg)", color: "var(--bg)" }}
      >
        <FileDown aria-hidden="true" size={15} strokeWidth={1.8} />
        {status === "loading" ? "Generating…" : "Generate PDF"}
      </button>
    </div>
  );
}

function normalizePortfolioSlug(value: string) {
  let candidate = value.trim();
  if (!candidate) return "";

  try {
    if (/^https?:\/\//i.test(candidate)) {
      const url = new URL(candidate);
      candidate = url.pathname === "/" ? url.hostname.split(".")[0] : url.pathname;
    }
  } catch {
    return "";
  }

  candidate = candidate.replace(/^\/?p\//, "").replace(/^\/+|\/+$/g, "").toLowerCase();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate) && candidate.length <= 160 ? candidate : "";
}
