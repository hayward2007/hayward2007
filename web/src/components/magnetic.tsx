"use client";

import { useRef } from "react";
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

  function onMouseMove(e: ReactMouseEvent<HTMLDivElement>) {
    // While an easter egg is active, a physics-tagged descendant may be
    // position:fixed relying on this ancestor having no transform of its
    // own — setting one here would wrongly make this div its containing
    // block, mispositioning/hiding it (same class of bug as TiltCard's).
    if (document.body.dataset.easterEgg) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  }

  function onMouseLeave() {
    if (document.body.dataset.easterEgg) return;
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
