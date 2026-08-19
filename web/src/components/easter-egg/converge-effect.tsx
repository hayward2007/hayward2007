"use client";

import { useEffect, useRef } from "react";
import type { EasterEggEffectProps } from "@/components/easter-egg/types";

const SELECTOR = "main [data-physics]";
const MAX_ITEMS = 60;
const EASE_IN_MS = 750;
const FLY_BACK_MS = 600;
const MIN_SCALE = 0.4;

type Item = { el: HTMLElement; left: number; top: number; centerX: number; centerY: number; startedAt: number };

// Everything eases toward the viewport center (with a slight scale-down) and
// holds there with a gentle breathing pulse, then flies back to its original
// spot on close — the "gather to the center" effect.
export function ConvergeEffect({ closing, onFinished }: EasterEggEffectProps) {
  const savedStyles = useRef<Map<HTMLElement, string>>(new Map());
  const itemsRef = useRef<Item[]>([]);
  const closingRef = useRef(false);
  const onFinishedRef = useRef(onFinished);
  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const viewportH = window.innerHeight;
    const outermost = Array.from(main.querySelectorAll<HTMLElement>(SELECTOR)).filter(
      (el) => el.offsetWidth > 4 && el.offsetHeight > 4,
    );
    const nearViewport = outermost.filter((el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > -viewportH && r.top < viewportH * 2;
    });
    const els = (nearViewport.length > 0 ? nearViewport : outermost).slice(0, MAX_ITEMS);

    if (els.length === 0) {
      onFinishedRef.current();
      return;
    }

    const savedMap = savedStyles.current;

    // Same containing-block neutralization GravityEffect/ZeroGravityEffect need
    // for a position:fixed descendant to mean "relative to the viewport."
    function neutralizeAncestorTransforms(el: HTMLElement) {
      let node = el.parentElement;
      while (node && node !== main) {
        const style = getComputedStyle(node);
        if (!savedMap.has(node) && (style.transform !== "none" || style.transformStyle === "preserve-3d")) {
          savedMap.set(node, node.getAttribute("style") || "");
          node.style.transform = "none";
          node.style.transformStyle = "flat";
        }
        node = node.parentElement;
      }
    }

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const now = performance.now();

    const items: Item[] = els.map((el) => {
      const rect = el.getBoundingClientRect();
      neutralizeAncestorTransforms(el);
      savedMap.set(el, el.getAttribute("style") || "");
      el.style.position = "fixed";
      el.style.left = `${rect.left}px`;
      el.style.top = `${rect.top}px`;
      el.style.width = `${rect.width}px`;
      el.style.height = `${rect.height}px`;
      el.style.margin = "0";
      el.style.zIndex = "400";
      el.style.transformOrigin = "center";
      el.style.willChange = "transform";
      return {
        el,
        left: rect.left,
        top: rect.top,
        centerX: centerX - (rect.left + rect.width / 2),
        centerY: centerY - (rect.top + rect.height / 2),
        startedAt: now,
      };
    });
    itemsRef.current = items;

    function easeOutCubic(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    let raf = 0;
    function tick(time: number) {
      if (closingRef.current) return;
      items.forEach((item) => {
        const elapsed = time - item.startedAt;
        const t = Math.min(1, elapsed / EASE_IN_MS);
        const eased = easeOutCubic(t);
        const breathe = t >= 1 ? Math.sin(time / 500) * 0.03 : 0;
        const scale = 1 - (1 - MIN_SCALE) * eased + breathe;
        item.el.style.transform = `translate(${item.centerX * eased}px, ${item.centerY * eased}px) scale(${scale.toFixed(3)})`;
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
    itemsRef.current.forEach((item) => {
      item.el.style.transition = `transform ${FLY_BACK_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
      item.el.style.transform = "translate(0px, 0px) scale(1)";
    });
    const t = setTimeout(() => onFinishedRef.current(), FLY_BACK_MS + 40);
    return () => clearTimeout(t);
  }, [closing]);

  return null;
}
