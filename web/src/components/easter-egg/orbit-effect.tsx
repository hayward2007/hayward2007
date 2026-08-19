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
  originX: number; // vector from this item's own original center to the viewport center
  originY: number;
  radius: number;
  angle: number;
  angularSpeed: number;
};

// Each element revolves around the viewport center on its own orbit (radius =
// its own original distance from center, so nothing jumps to get there), then
// flies back to its exact original spot on close.
export function OrbitEffect({ closing, onFinished }: EasterEggEffectProps) {
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

      const ownCenterX = rect.left + rect.width / 2;
      const ownCenterY = rect.top + rect.height / 2;
      const originX = centerX - ownCenterX;
      const originY = centerY - ownCenterY;
      const radius = Math.hypot(originX, originY) || 1;
      const angle = Math.atan2(-originY, -originX); // starts exactly at its own position
      return {
        el,
        left: rect.left,
        top: rect.top,
        originX,
        originY,
        radius,
        angle,
        angularSpeed: (0.15 + Math.random() * 0.25) * (Math.random() < 0.5 ? 1 : -1),
      };
    });
    itemsRef.current = items;

    let raf = 0;
    let last = performance.now();
    function tick(time: number) {
      if (closingRef.current) return;
      const dt = Math.min(0.05, (time - last) / 1000);
      last = time;
      items.forEach((item) => {
        item.angle += item.angularSpeed * dt;
        // Position on the orbit circle, expressed as an offset from this item's
        // own original position (originX/Y is that circle's center, relative to it).
        const offsetX = item.originX + item.radius * Math.cos(item.angle);
        const offsetY = item.originY + item.radius * Math.sin(item.angle);
        item.el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
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
      item.el.style.transform = "translate(0px, 0px)";
    });
    const t = setTimeout(() => onFinishedRef.current(), FLY_BACK_MS + 40);
    return () => clearTimeout(t);
  }, [closing]);

  return null;
}
