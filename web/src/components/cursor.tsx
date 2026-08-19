"use client";

import { useEffect, useRef, useState } from "react";

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarse || reduced) return;
    // One-time client-only capability check on mount; not derivable during SSR render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true);

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;

    function onMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      }
      const target = e.target as HTMLElement;
      const magnet = target.closest<HTMLElement>("[data-cursor]");
      setHovering(Boolean(magnet));
      setLabel(magnet?.dataset.cursor === "true" ? "" : magnet?.dataset.cursor || "");
    }

    let raf = 0;
    function tick() {
      ringX += (mouseX - ringX) * 0.38;
      ringY += (mouseY - ringY) * 0.38;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`;
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[999] mix-blend-difference">
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--fg-inverted)]"
      />
      <div
        ref={ringRef}
        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--fg-inverted)] transition-[width,height] duration-100 ease-out flex items-center justify-center text-[10px] uppercase tracking-[0.08em] text-[var(--fg-inverted)]"
        style={{ width: hovering ? 64 : 28, height: hovering ? 64 : 28 }}
      >
        {label}
      </div>
    </div>
  );
}
