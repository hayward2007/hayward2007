"use client";

import { useEffect, useRef } from "react";
import type { EasterEggEffectProps } from "@/components/easter-egg/types";

const SELECTOR = "main [data-physics]";
const FADE_MS = 500;

export function RainbowEffect({ closing, onFinished }: EasterEggEffectProps) {
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

    let raf = 0;
    let hue = 0;
    // Slightly different speed/phase per element so the whole page reads as
    // a rolling rainbow wave instead of every tile flashing in lockstep.
    const phases = els.map(() => Math.random() * 360);

    function tick() {
      // Frozen the instant a close was requested — the fade-out effect below
      // takes over writing this same filter via a CSS transition instead.
      if (closingRef.current) {
        raf = requestAnimationFrame(tick);
        return;
      }
      hue = (hue + 2) % 360;
      els.forEach((el, i) => {
        el.style.filter = `hue-rotate(${(hue + phases[i]).toFixed(0)}deg) saturate(2.2) brightness(1.05)`;
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
    const els = elsRef.current;
    els.forEach((el) => {
      el.style.transition = `filter ${FADE_MS}ms ease`;
      el.style.filter = "hue-rotate(0deg) saturate(1) brightness(1)";
    });
    const t = setTimeout(() => onFinishedRef.current(), FADE_MS + 40);
    return () => clearTimeout(t);
  }, [closing]);

  return null;
}
