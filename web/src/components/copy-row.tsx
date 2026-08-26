"use client";

import { useState } from "react";
import { useDict } from "@/components/locale-provider";

export function CopyRow({ label, value, href }: { label: string; value: string; href?: string }) {
  const dict = useDict();
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      if (href) window.location.href = href;
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      data-cursor="Copy"
      data-physics
      className="group flex w-full items-center justify-between border-b py-5 text-left"
      style={{ borderColor: "var(--line)", background: "var(--bg)" }}
    >
      <span className="type-label" style={{ color: "var(--fg-3)" }}>
        {label}
      </span>
      <span className="font-display flex items-center gap-3 text-lg font-semibold md:text-xl">
        {value}
        <span
          className="type-label transition-opacity duration-150"
          style={{ color: "var(--accent-robotics)", opacity: copied ? 1 : 0 }}
        >
          {copied ? dict.common.copied : ""}
        </span>
      </span>
    </button>
  );
}
