"use client";

import { useEffect, useRef } from "react";
import type { EasterEggEffectProps } from "@/components/easter-egg/types";

const SELECTOR = "main [data-physics]";
const MAX_ITEMS = 60;
const FLY_BACK_MS = 600;

type Item = {
  el: HTMLElement;
  left: number;
  top: number;
  ampX: number;
  ampY: number;
  speedX: number;
  speedY: number;
  phaseX: number;
  phaseY: number;
  rotAmp: number;
  rotSpeed: number;
  rotPhase: number;
};

// A calmer, physics-free cousin of GravityEffect: elements detach and drift
// on independent sine waves instead of falling, then ease straight back to
// their original spot on close — no matter-js engine needed for this one.
export function ZeroGravityEffect({ closing, onFinished }: EasterEggEffectProps) {
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
    const els = Array.from(main.querySelectorAll<HTMLElement>(SELECTOR))
      .filter((el) => el.offsetWidth > 4 && el.offsetHeight > 4)
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > -viewportH && r.top < viewportH * 2;
      })
      .slice(0, MAX_ITEMS);

    if (els.length === 0) {
      onFinishedRef.current();
      return;
    }

    const savedMap = savedStyles.current;

    // A `position: fixed` descendant is positioned relative to the nearest ancestor
    // that establishes a containing block — which per spec includes any ancestor with
    // a `transform` other than none, or `transform-style: preserve-3d` (TiltCard sets
    // this permanently for its own tilt). Neutralize both up to <main> so position:fixed
    // here means what it's supposed to mean. Mirrors gravity-effect.tsx's own fix for
    // the same issue.
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
      el.style.willChange = "transform";
      return {
        el,
        left: rect.left,
        top: rect.top,
        ampX: 8 + Math.random() * 14,
        ampY: 10 + Math.random() * 16,
        speedX: 0.4 + Math.random() * 0.5,
        speedY: 0.35 + Math.random() * 0.45,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        rotAmp: 1.5 + Math.random() * 3,
        rotSpeed: 0.3 + Math.random() * 0.4,
        rotPhase: Math.random() * Math.PI * 2,
      };
    });
    itemsRef.current = items;

    let raf = 0;
    let t = 0;
    function tick() {
      if (closingRef.current) return;
      t += 1 / 60;
      items.forEach((item) => {
        const dx = Math.sin(t * item.speedX + item.phaseX) * item.ampX;
        const dy = Math.cos(t * item.speedY + item.phaseY) * item.ampY;
        const rot = Math.sin(t * item.rotSpeed + item.rotPhase) * item.rotAmp;
        item.el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot.toFixed(2)}deg)`;
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
      item.el.style.transform = "translate(0px, 0px) rotate(0deg)";
    });
    const t = setTimeout(() => onFinishedRef.current(), FLY_BACK_MS + 40);
    return () => clearTimeout(t);
  }, [closing]);

  return null;
}
