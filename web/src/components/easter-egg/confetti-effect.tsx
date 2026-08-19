"use client";

import { useEffect, useRef } from "react";
import type { EasterEggEffectProps } from "@/components/easter-egg/types";

const COLORS = ["#0e8f7c", "#e0562c", "#4a6cf7", "#f2c94c", "#e0e0e0"];
const COUNT = 160;
const FADE_MS = 400;

type Piece = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; w: number; h: number; color: string };

// Purely decorative — nothing in the page is touched, so closing is just a
// fade-out rather than any "return to place" logic.
export function ConfettiEffect({ closing, onFinished }: EasterEggEffectProps) {
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
    document.body.appendChild(canvas);
    canvasRef.current = canvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pieces: Piece[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.5,
      vx: (Math.random() - 0.5) * 2.2,
      vy: 2 + Math.random() * 3,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.2,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);

    let raf = 0;
    function tick() {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rot);
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx!.restore();
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.remove();
      canvasRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!closing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.transition = `opacity ${FADE_MS}ms ease`;
      canvas.style.opacity = "0";
    }
    const t = setTimeout(() => onFinishedRef.current(), FADE_MS + 40);
    return () => clearTimeout(t);
  }, [closing]);

  return null;
}
