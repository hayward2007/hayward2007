import { ColorPaletteTool } from "@/components/tools/color-palette-tool";

export default function ColorPalettePage() {
  return (
    <main className="py-16 md:py-24">
      <div className="wrap">
        <p className="type-page-kicker" style={{ color: "var(--accent-ai)" }}>
          Tools — Color Palette
        </p>
        <h1 className="type-tool-title mt-4 max-w-4xl">Pull the dominant colors out of an image.</h1>
        <div className="mt-12">
          <ColorPaletteTool />
        </div>
      </div>
    </main>
  );
}
