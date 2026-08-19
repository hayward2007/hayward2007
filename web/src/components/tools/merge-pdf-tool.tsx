"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";

export function MergePdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])]);
    e.target.value = "";
  }

  function remove(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function merge() {
    if (files.length < 2) {
      setError("Add at least two PDF files.");
      return;
    }
    setWorking(true);
    setError("");
    try {
      const merged = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((page) => merged.addPage(page));
      }
      const bytes = await merged.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Couldn't merge those files — make sure they're all valid PDFs.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <label
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-10 text-center text-sm"
        style={{ borderColor: "var(--line-strong)" }}
      >
        <span>Click to add PDF files</span>
        <span style={{ color: "var(--fg-3)" }}>Processed locally in your browser</span>
        <input type="file" accept="application/pdf" multiple onChange={onPick} className="hidden" />
      </label>

      {files.length > 0 && (
        <ul className="divide-y rounded-xl border" style={{ borderColor: "var(--line)" }}>
          {files.map((file, i) => (
            <li key={i} className="flex items-center justify-between px-4 py-2 text-sm">
              <span>{file.name}</span>
              <button type="button" onClick={() => remove(i)} style={{ color: "var(--fg-3)" }}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="button"
        onClick={merge}
        disabled={working}
        className="rounded-lg px-4 py-2 text-sm font-medium"
        style={{ background: "var(--fg)", color: "var(--bg)" }}
      >
        {working ? "Merging…" : "Merge & download"}
      </button>
    </div>
  );
}
