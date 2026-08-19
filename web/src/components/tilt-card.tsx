"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode, MouseEvent as ReactMouseEvent } from "react";
import { useHasHover } from "@/lib/use-has-hover";

export function TiltCard({
  children,
  className,
  intensity = 5,
  style,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hasHover = useHasHover();
  // Native mousemove can fire well above 60/sec; writing style.transform on
  // every single event is more synchronous layout/paint work than any one
  // frame needs. Collapse to at most one write per animation frame instead.
  const pendingRef = useRef<{ px: number; py: number } | null>(null);
  const rafRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  function scheduleApply() {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const el = ref.current;
      const point = pendingRef.current;
      if (!el || !point) return;
      el.style.transform = `perspective(1200px) rotateX(${(-point.py * intensity).toFixed(2)}deg) rotateY(${(point.px * intensity).toFixed(2)}deg)`;
    });
  }

  function onMouseMove(e: ReactMouseEvent<HTMLDivElement>) {
    if (!hasHover) return;
    // While an easter egg is active, physics-tagged descendants may be
    // position:fixed relying on this ancestor having no transform of its
    // own — rewriting one here would re-clip them via our overflow-hidden.
    if (document.body.dataset.easterEgg) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    pendingRef.current = {
      px: (e.clientX - rect.left) / rect.width - 0.5,
      py: (e.clientY - rect.top) / rect.height - 0.5,
    };
    scheduleApply();
  }

  function onMouseLeave() {
    if (document.body.dataset.easterEgg) return;
    pendingRef.current = null;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
  }

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ ...style, transition: "transform 0.2s var(--ease)", transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}
