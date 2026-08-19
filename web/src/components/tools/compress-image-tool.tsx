"use client";

import { useRef, useState } from "react";

export function CompressImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.7);
  const [maxWidth, setMaxWidth] = useState(1600);
  const [originalSize, setOriginalSize] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [working, setWorking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setOriginalSize(f.size);
    setResultUrl("");
    setResultSize(0);
  }

  async function compress() {
    if (!file) return;
    setWorking(true);
    try {
      const img = await loadImage(file);
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = canvasRef.current!;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);

      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", quality),
      );
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
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
        <span>{file ? file.name : "Click to choose an image"}</span>
        <span style={{ color: "var(--fg-3)" }}>Processed locally in your browser</span>
        <input type="file" accept="image/*" onChange={onPick} className="hidden" />
      </label>

      {file && (
        <>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Quality</span>
                <span style={{ color: "var(--fg-3)" }}>{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="mt-2 w-full"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Max width</span>
                <span style={{ color: "var(--fg-3)" }}>{maxWidth}px</span>
              </div>
              <input
                type="range"
                min={320}
                max={4000}
                step={40}
                value={maxWidth}
                onChange={(e) => setMaxWidth(Number(e.target.value))}
                className="mt-2 w-full"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={compress}
            disabled={working}
            className="rounded-lg px-4 py-2 text-sm font-medium"
            style={{ background: "var(--fg)", color: "var(--bg)" }}
          >
            {working ? "Compressing…" : "Compress"}
          </button>

          <canvas ref={canvasRef} className="hidden" />

          {resultUrl && (
            <div className="rounded-xl border p-4 text-sm" style={{ borderColor: "var(--line)" }}>
              <p>
                {formatBytes(originalSize)} → <strong>{formatBytes(resultSize)}</strong> (
                {Math.round((1 - resultSize / originalSize) * 100)}% smaller)
              </p>
              <a
                href={resultUrl}
                download="compressed.jpg"
                className="mt-3 inline-block rounded-lg px-4 py-2 text-sm font-medium"
                style={{ background: "var(--fg)", color: "var(--bg)" }}
              >
                Download
              </a>
            </div>
          )}
        </>
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

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
