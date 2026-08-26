"use client";

import { useEffect, useRef } from "react";
import { getVisiblePhysicsContext } from "@/components/easter-egg/targets";
import type { EasterEggEffectProps } from "@/components/easter-egg/types";

const SETTLE_MS = 300;

export function ShockwaveEffect({ closing, onFinished }: EasterEggEffectProps) {
  const savedStyles = useRef<Map<HTMLElement, string>>(new Map());
  const elsRef = useRef<HTMLElement[]>([]);
  const ringsRef = useRef<HTMLDivElement[]>([]);
  const closingRef = useRef(false);
  const onFinishedRef = useRef(onFinished);
  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    const { targets: els } = getVisiblePhysicsContext();
    if (els.length === 0) {
      onFinishedRef.current();
      return;
    }

    const savedMap = savedStyles.current;
    els.forEach((el) => savedMap.set(el, el.getAttribute("style") || ""));
    elsRef.current = els;
    const phases = els.map(() => Math.random() * Math.PI * 2);
    const rings = Array.from({ length: 2 }, () => {
      const ring = document.createElement("div");
      ring.style.position = "fixed";
      ring.style.left = "50%";
      ring.style.top = "50%";
      ring.style.width = "12vmin";
      ring.style.height = "12vmin";
      ring.style.border = "2px solid var(--accent-signal)";
      ring.style.borderRadius = "50%";
      ring.style.boxShadow = "0 0 18px color-mix(in srgb, var(--accent-signal) 55%, transparent)";
      ring.style.pointerEvents = "none";
      ring.style.zIndex = "439";
      ring.style.willChange = "transform, opacity";
      document.body.appendChild(ring);
      return ring;
    });
    ringsRef.current = rings;
    const startedAt = performance.now();

    let raf = 0;
    function tick(time: number) {
      if (closingRef.current) return;
      els.forEach((el, i) => {
        const t = time / 900 + phases[i];
        const pulse = (Math.sin(t) + 1) / 2; // 0..1
        const scale = 1 + pulse * 0.055;
        const spread = 8 + pulse * 28;
        const alpha = 22 + pulse * 43;
        el.style.transform = `scale(${scale.toFixed(3)})`;
        el.style.boxShadow = `0 0 ${spread.toFixed(1)}px ${(spread / 3).toFixed(1)}px color-mix(in srgb, var(--accent-signal) ${alpha.toFixed(0)}%, transparent)`;
      });
      rings.forEach((ring, i) => {
        const progress = ((time - startedAt) / 1600 + i * 0.5) % 1;
        const eased = 1 - Math.pow(1 - progress, 2);
        ring.style.transform = `translate(-50%, -50%) scale(${(0.35 + eased * 7).toFixed(3)})`;
        ring.style.opacity = (Math.sin(Math.PI * progress) * 0.72).toFixed(3);
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      savedMap.forEach((style, el) => {
        if (style) el.setAttribute("style", style);
        else el.removeAttribute("style");
      });
      savedMap.clear();
      rings.forEach((ring) => ring.remove());
      ringsRef.current = [];
    };
  }, []);

  useEffect(() => {
    closingRef.current = closing;
    if (!closing) return;
    elsRef.current.forEach((el) => {
      el.style.transition = `transform ${SETTLE_MS}ms ease, box-shadow ${SETTLE_MS}ms ease`;
      el.style.transform = "scale(1)";
      el.style.boxShadow = "none";
    });
    ringsRef.current.forEach((ring) => {
      ring.style.transition = `opacity ${SETTLE_MS}ms ease`;
      ring.style.opacity = "0";
    });
    const t = setTimeout(() => onFinishedRef.current(), SETTLE_MS + 40);
    return () => clearTimeout(t);
  }, [closing]);

  return null;
}
