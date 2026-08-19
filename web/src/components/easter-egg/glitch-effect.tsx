"use client";

import { useEffect, useRef } from "react";
import type { EasterEggEffectProps } from "@/components/easter-egg/types";

const SELECTOR = "main [data-physics]";
const TICK_MS = 90;
const SETTLE_MS = 300;

export function GlitchEffect({ closing, onFinished }: EasterEggEffectProps) {
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

    function jitter() {
      if (closingRef.current) return;
      els.forEach((el) => {
        const spike = Math.random() < 0.12;
        const dx = (Math.random() - 0.5) * (spike ? 14 : 3);
        const dy = (Math.random() - 0.5) * (spike ? 6 : 1.5);
        const split = spike ? 6 : 2;
        el.style.transition = "none";
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        el.style.filter = `drop-shadow(${split}px 0 rgba(255,0,80,0.75)) drop-shadow(${-split}px 0 rgba(0,230,255,0.75))`;
      });
    }
    const interval = window.setInterval(jitter, TICK_MS);
    jitter();

    return () => {
      window.clearInterval(interval);
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
      el.style.transition = `transform ${SETTLE_MS}ms ease, filter ${SETTLE_MS}ms ease`;
      el.style.transform = "translate(0px, 0px)";
      el.style.filter = "none";
    });
    const t = setTimeout(() => onFinishedRef.current(), SETTLE_MS + 40);
    return () => clearTimeout(t);
  }, [closing]);

  return null;
}
