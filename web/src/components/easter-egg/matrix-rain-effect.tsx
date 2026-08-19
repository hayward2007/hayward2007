"use client";

import { useEffect, useRef } from "react";
import type { EasterEggEffectProps } from "@/components/easter-egg/types";

const FONT_SIZE = 16;
const FADE_MS = 400;
const CHARS = "アイウエオカキクケコサシスセソタチツテト0123456789";

// A pure decorative overlay — nothing in the page is touched, so closing is
// just a fade-out rather than any "return to place" logic.
export function MatrixRainEffect({ closing, onFinished }: EasterEggEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onFinishedRef = useRef(onFinished);
  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.zIndex = "440";
    canvas.style.pointerEvents = "none";
    canvas.style.opacity = "0";
    canvas.style.transition = `opacity ${FADE_MS}ms ease`;
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    let columns = Math.ceil(canvas.width / FONT_SIZE);
    let drops = Array.from({ length: columns }, () => Math.random() * -50);

    function resetColumns() {
      columns = Math.ceil(canvas.width / FONT_SIZE);
      drops = Array.from({ length: columns }, () => Math.random() * -50);
    }
    window.addEventListener("resize", resetColumns);

    requestAnimationFrame(() => {
      canvas.style.opacity = "1";
    });

    let raf = 0;
    function tick() {
      ctx!.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      ctx!.font = `${FONT_SIZE}px monospace`;
      drops.forEach((y, i) => {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * FONT_SIZE;
        ctx!.fillStyle = Math.random() < 0.05 ? "#c8ffe0" : "#0e8f7c";
        ctx!.fillText(char, x, y * FONT_SIZE);
        drops[i] = y * FONT_SIZE > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", resetColumns);
      canvas.remove();
      canvasRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!closing) return;
    const canvas = canvasRef.current;
    if (canvas) canvas.style.opacity = "0";
    const t = setTimeout(() => onFinishedRef.current(), FADE_MS + 40);
    return () => clearTimeout(t);
  }, [closing]);

  return null;
}
