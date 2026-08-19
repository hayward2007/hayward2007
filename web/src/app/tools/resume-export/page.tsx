import { ResumeExportTool } from "@/components/tools/resume-export-tool";

export default function ResumeExportPage() {
  return (
    <main className="py-20">
      <div className="wrap">
        <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-ai)" }}>
          Tools — Résumé Export
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Turn a portfolio into a PDF.</h1>
        <div className="mt-10">
          <ResumeExportTool />
        </div>
      </div>
    </main>
  );
}
