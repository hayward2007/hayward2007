"use client";

import { useEffect, useRef } from "react";
import type { EasterEggEffectProps } from "@/components/easter-egg/types";

const SELECTOR = "main [data-physics]";
const SETTLE_MS = 300;

export function ShockwaveEffect({ closing, onFinished }: EasterEggEffectProps) {
  const savedStyles = useRef<Map<HTMLElement, string>>(new Map());
  const elsRef = useRef<HTMLElement[]>([]);
  const closingRef = useRef(false);
  const onFinishedRef = useRef(onFinished);
  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const els = Array.from(main.querySelectorAll<HTMLElement>(SELECTOR));
    if (els.length === 0) {
      onFinishedRef.current();
      return;
    }

    const savedMap = savedStyles.current;
    els.forEach((el) => savedMap.set(el, el.getAttribute("style") || ""));
    elsRef.current = els;
    const phases = els.map(() => Math.random() * Math.PI * 2);

    let raf = 0;
    function tick(time: number) {
      if (closingRef.current) return;
      els.forEach((el, i) => {
        const t = time / 900 + phases[i];
        const pulse = (Math.sin(t) + 1) / 2; // 0..1
        const scale = 1 + pulse * 0.035;
        const spread = 4 + pulse * 22;
        const alpha = 15 + pulse * 35;
        el.style.transform = `scale(${scale.toFixed(3)})`;
        el.style.boxShadow = `0 0 ${spread.toFixed(1)}px ${(spread / 3).toFixed(1)}px color-mix(in srgb, var(--accent-signal) ${alpha.toFixed(0)}%, transparent)`;
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
    const t = setTimeout(() => onFinishedRef.current(), SETTLE_MS + 40);
    return () => clearTimeout(t);
  }, [closing]);

  return null;
}
