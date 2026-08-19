"use client";

import { useEffect, useRef } from "react";
import type { EasterEggEffectProps } from "@/components/easter-egg/types";

const STAR_COUNT = 220;
const FADE_MS = 400;
const FOCAL_LENGTH = 200;
const SPEED = 320;

type Star = { x: number; y: number; z: number; prevScreenX: number; prevScreenY: number };

// A pure decorative overlay — nothing in the page is touched, so closing is
// just a fade-out rather than any "return to place" logic.
export function WarpEffect({ closing, onFinished }: EasterEggEffectProps) {
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

    function spawnStar(): Star {
      return {
        x: (Math.random() - 0.5) * canvas.width,
        y: (Math.random() - 0.5) * canvas.height,
        z: FOCAL_LENGTH + Math.random() * 800,
        prevScreenX: 0,
        prevScreenY: 0,
      };
    }
    const stars: Star[] = Array.from({ length: STAR_COUNT }, spawnStar);
    stars.forEach((s) => {
      s.prevScreenX = canvas.width / 2 + (s.x / s.z) * FOCAL_LENGTH;
      s.prevScreenY = canvas.height / 2 + (s.y / s.z) * FOCAL_LENGTH;
    });

    requestAnimationFrame(() => {
      canvas.style.opacity = "1";
    });

    let raf = 0;
    let last = performance.now();
    function tick(time: number) {
      const dt = Math.min(0.05, (time - last) / 1000);
      last = time;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      ctx!.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx!.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((s) => {
        const screenX = cx + (s.x / s.z) * FOCAL_LENGTH;
        const screenY = cy + (s.y / s.z) * FOCAL_LENGTH;
        const brightness = Math.min(1, 1 - s.z / 900);

        ctx!.strokeStyle = `rgba(255, 255, 255, ${0.15 + brightness * 0.7})`;
        ctx!.lineWidth = Math.max(0.6, brightness * 2.2);
        ctx!.beginPath();
        ctx!.moveTo(s.prevScreenX, s.prevScreenY);
        ctx!.lineTo(screenX, screenY);
        ctx!.stroke();

        s.prevScreenX = screenX;
        s.prevScreenY = screenY;
        s.z -= SPEED * dt;
        if (s.z < FOCAL_LENGTH * 0.5) {
          const fresh = spawnStar();
          s.x = fresh.x;
          s.y = fresh.y;
          s.z = fresh.z;
          s.prevScreenX = cx + (s.x / s.z) * FOCAL_LENGTH;
          s.prevScreenY = cy + (s.y / s.z) * FOCAL_LENGTH;
        }
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
    if (canvas) canvas.style.opacity = "0";
    const t = setTimeout(() => onFinishedRef.current(), FADE_MS + 40);
    return () => clearTimeout(t);
  }, [closing]);

  return null;
}
