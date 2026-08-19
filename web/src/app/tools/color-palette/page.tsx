import { ColorPaletteTool } from "@/components/tools/color-palette-tool";

export default function ColorPalettePage() {
  return (
    <main className="py-20">
      <div className="wrap">
        <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-ai)" }}>
          Tools — Color Palette
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Pull the dominant colors out of an image.</h1>
        <div className="mt-10">
          <ColorPaletteTool />
        </div>
      </div>
    </main>
  );
}
