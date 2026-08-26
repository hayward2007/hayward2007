import { MergePdfTool } from "@/components/tools/merge-pdf-tool";

export default function MergePdfPage() {
  return (
    <main className="py-16 md:py-24">
      <div className="wrap">
        <p className="type-page-kicker" style={{ color: "var(--accent-ai)" }}>
          Tools — Merge PDF
        </p>
        <h1 className="type-tool-title mt-4 max-w-4xl">Combine PDFs, client-side.</h1>
        <div className="mt-12">
          <MergePdfTool />
        </div>
      </div>
    </main>
  );
}
