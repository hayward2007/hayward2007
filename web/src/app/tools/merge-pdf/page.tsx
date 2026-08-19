import { MergePdfTool } from "@/components/tools/merge-pdf-tool";

export default function MergePdfPage() {
  return (
    <main className="py-20">
      <div className="wrap">
        <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-ai)" }}>
          Tools — Merge PDF
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Combine PDFs, client-side.</h1>
        <div className="mt-10">
          <MergePdfTool />
        </div>
      </div>
    </main>
  );
}
