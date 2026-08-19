"use client";

import { useEffect, useRef } from "react";
import type { EasterEggEffectProps } from "@/components/easter-egg/types";

const PARTICLE_COUNT = 140;
const FADE_MS = 400;

type Particle = { angle: number; radius: number; angularSpeed: number; inwardSpeed: number; size: number; hue: number };

// A pure decorative overlay — nothing in the page is touched, so closing is
// just a fade-out rather than any "return to place" logic.
export function VortexEffect({ closing, onFinished }: EasterEggEffectProps) {
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

    const maxRadius = Math.hypot(window.innerWidth, window.innerHeight) / 2;
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: Math.random() * maxRadius,
      angularSpeed: 0.6 + Math.random() * 1.2,
      inwardSpeed: 30 + Math.random() * 60,
      size: 1.5 + Math.random() * 2.5,
      hue: 160 + Math.random() * 80,
    }));

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

      ctx!.fillStyle = "rgba(5, 5, 8, 0.14)";
      ctx!.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.angle += p.angularSpeed * dt;
        p.radius -= p.inwardSpeed * dt;
        if (p.radius < 4) {
          p.radius = maxRadius * (0.85 + Math.random() * 0.15);
          p.angle = Math.random() * Math.PI * 2;
        }
        const x = cx + Math.cos(p.angle) * p.radius;
        const y = cy + Math.sin(p.angle) * p.radius * 0.7; // slight ellipse for a less mechanical spiral
        ctx!.beginPath();
        ctx!.fillStyle = `hsla(${p.hue}, 85%, 65%, 0.9)`;
        ctx!.arc(x, y, p.size, 0, Math.PI * 2);
        ctx!.fill();
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
