import { CompressImageTool } from "@/components/tools/compress-image-tool";

export default function CompressImagePage() {
  return (
    <main className="py-16 md:py-24">
      <div className="wrap">
        <p className="type-page-kicker" style={{ color: "var(--accent-ai)" }}>
          Tools — Compress Image
        </p>
        <h1 className="type-tool-title mt-4 max-w-4xl">Shrink an image, client-side.</h1>
        <div className="mt-12">
          <CompressImageTool />
        </div>
      </div>
    </main>
  );
}
