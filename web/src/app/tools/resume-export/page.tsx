import { ResumeExportTool } from "@/components/tools/resume-export-tool";

export default function ResumeExportPage() {
  return (
    <main className="py-16 md:py-24">
      <div className="wrap">
        <p className="type-page-kicker" style={{ color: "var(--accent-ai)" }}>
          Tools — Résumé Export
        </p>
        <h1 className="type-tool-title mt-4 max-w-4xl">Turn a portfolio into a PDF.</h1>
        <div className="mt-12">
          <ResumeExportTool />
        </div>
      </div>
    </main>
  );
}
