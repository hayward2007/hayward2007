import { CompressImageTool } from "@/components/tools/compress-image-tool";

export default function CompressImagePage() {
  return (
    <main className="py-20">
      <div className="wrap">
        <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-ai)" }}>
          Tools — Compress Image
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Shrink an image, client-side.</h1>
        <div className="mt-10">
          <CompressImageTool />
        </div>
      </div>
    </main>
  );
}
