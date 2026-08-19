"use client";

import { useEffect, useRef } from "react";
import type { ReactNode, MouseEvent as ReactMouseEvent } from "react";

export function Magnetic({
  children,
  strength = 0.25,
  className,
  cursorLabel,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
  cursorLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Native mousemove can fire well above 60/sec; collapse to at most one
  // style write per animation frame instead of one per event.
  const pendingRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  function scheduleApply() {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const el = ref.current;
      const point = pendingRef.current;
      if (!el || !point) return;
      el.style.transform = `translate(${point.x * strength}px, ${point.y * strength}px)`;
    });
  }

  function onMouseMove(e: ReactMouseEvent<HTMLDivElement>) {
    // While an easter egg is active, a physics-tagged descendant may be
    // position:fixed relying on this ancestor having no transform of its
    // own — setting one here would wrongly make this div its containing
    // block, mispositioning/hiding it (same class of bug as TiltCard's).
    if (document.body.dataset.easterEgg) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    pendingRef.current = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
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
    el.style.transform = "translate(0, 0)";
  }

  return (
    <div
      ref={ref}
      className={className}
      data-cursor={cursorLabel ?? "true"}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ transition: "transform 0.14s var(--ease)" }}
    >
      {children}
    </div>
  );
}
