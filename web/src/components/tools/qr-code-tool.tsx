"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrCodeTool() {
  const [text, setText] = useState("https://hayward.kim");
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // No synchronous setState for the empty case — the JSX guard below
    // (`text.trim() && dataUrl`) already hides a stale preview without it.
    if (!text.trim()) return;
    let cancelled = false;
    QRCode.toDataURL(text, { width: 480, margin: 2 })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setError("");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't encode that text — try something shorter.");
      });
    return () => {
      cancelled = true;
    };
  }, [text]);

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <label className="text-sm" style={{ color: "var(--fg-3)" }}>
          Text or URL
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="mt-2 w-full rounded-lg border p-3 text-sm"
          style={{ borderColor: "var(--line-strong)", background: "var(--bg-raised)" }}
        />
      </div>

      {error && <p className="text-sm" style={{ color: "var(--accent-signal)" }}>{error}</p>}

      {text.trim() && dataUrl && (
        <div className="flex flex-col items-start gap-4 rounded-xl border p-4" style={{ borderColor: "var(--line)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt="Generated QR code" width={240} height={240} className="rounded-lg" />
          <a
            href={dataUrl}
            download="qr-code.png"
            className="inline-block rounded-lg px-4 py-2 text-sm font-medium"
            style={{ background: "var(--fg)", color: "var(--bg)" }}
          >
            Download PNG
          </a>
        </div>
      )}
    </div>
  );
}
