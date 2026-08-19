"use client";

import { useRef, useState } from "react";

const SAMPLE_SIZE = 80; // downscale target — palette extraction doesn't need full resolution
const BUCKET = 24; // quantization step per channel, groups near-identical colors together
const SWATCH_COUNT = 6;

type Swatch = { hex: string; count: number };

export function ColorPaletteTool() {
  const [preview, setPreview] = useState("");
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [copied, setCopied] = useState("");
  const [working, setWorking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSwatches([]);
    setPreview(URL.createObjectURL(file));
    extract(file);
  }

  async function extract(file: File) {
    setWorking(true);
    try {
      const img = await loadImage(file);
      const scale = Math.min(1, SAMPLE_SIZE / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));

      const canvas = canvasRef.current!;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);

      const { data } = ctx.getImageData(0, 0, w, h);
      const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha < 200) continue; // skip near-transparent pixels
        const r = Math.round(data[i] / BUCKET) * BUCKET;
        const g = Math.round(data[i + 1] / BUCKET) * BUCKET;
        const b = Math.round(data[i + 2] / BUCKET) * BUCKET;
        const key = `${r},${g},${b}`;
        const existing = buckets.get(key);
        if (existing) existing.count += 1;
        else buckets.set(key, { r, g, b, count: 1 });
      }

      const top = [...buckets.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, SWATCH_COUNT)
        .map((c) => ({ hex: toHex(c.r, c.g, c.b), count: c.count }));
      setSwatches(top);
    } finally {
      setWorking(false);
    }
  }

  function copy(hex: string) {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    window.setTimeout(() => setCopied(""), 1200);
  }

  return (
    <div className="max-w-xl space-y-6">
      <label
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-10 text-center text-sm"
        style={{ borderColor: "var(--line-strong)" }}
      >
        <span>{preview ? "Choose a different image" : "Click to choose an image"}</span>
        <span style={{ color: "var(--fg-3)" }}>Processed locally in your browser</span>
        <input type="file" accept="image/*" onChange={onPick} className="hidden" />
      </label>

      <canvas ref={canvasRef} className="hidden" />

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="max-h-56 w-full rounded-xl object-cover" />
      )}

      {working && <p className="text-sm" style={{ color: "var(--fg-3)" }}>Sampling colors…</p>}

      {swatches.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {swatches.map((s) => (
            <button
              key={s.hex}
              type="button"
              onClick={() => copy(s.hex)}
              className="flex flex-col items-center gap-2 rounded-xl border p-2 text-xs"
              style={{ borderColor: "var(--line)" }}
            >
              <span className="h-12 w-full rounded-lg" style={{ background: s.hex }} />
              <span className="font-mono">{copied === s.hex ? "Copied" : s.hex}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function toHex(r: number, g: number, b: number) {
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  return `#${[clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
