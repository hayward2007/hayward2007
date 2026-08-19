"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const DOT_COUNT = 48;

export function Preloader() {
  const [shouldRender, setShouldRender] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "aligning" | "exit">("loading");
  const [dots] = useState(() =>
    Array.from({ length: DOT_COUNT }, () => ({ x: Math.random() * 100, y: Math.random() * 100 })),
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.sessionStorage.getItem("hk-preloaded")) return;
    // One-time client-only sessionStorage check gating a mount animation; not derivable during SSR render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShouldRender(true);
    window.sessionStorage.setItem("hk-preloaded", "1");
  }, []);

  useEffect(() => {
    if (!shouldRender || phase !== "loading") return;
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + Math.random() * 30 + 14);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => setPhase("aligning"), 80);
        }
        return next;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [shouldRender, phase]);

  useEffect(() => {
    if (phase !== "aligning") return;
    const t = setTimeout(() => setPhase("exit"), 550);
    return () => clearTimeout(t);
  }, [phase]);

  if (!shouldRender) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex flex-col justify-between overflow-hidden p-8"
      style={{ background: "var(--bg)", color: "var(--fg)" }}
      initial={{ y: 0 }}
      animate={{ y: phase === "exit" ? "-100%" : 0 }}
      transition={{ duration: 0.5, ease: [0.87, 0, 0.13, 1] }}
      onAnimationComplete={() => phase === "exit" && setShouldRender(false)}
    >
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.1em]">
        <span>Hayward Kim — Physical AI Lab</span>
        <span className="tabular-nums">{String(Math.floor(progress)).padStart(3, "0")}</span>
      </div>

      <div className="relative flex-1">
        {dots.map((dot, i) => {
          const aligned = phase !== "loading";
          const targetX = 10 + (i / (DOT_COUNT - 1)) * 80;
          return (
            <span
              key={i}
              className="absolute h-1 w-1 rounded-full"
              style={{
                background: "var(--accent-robotics)",
                left: `${aligned ? targetX : dot.x}%`,
                top: aligned ? "50%" : `${dot.y}%`,
                transition: `left 0.5s cubic-bezier(0.16,1,0.3,1) ${aligned ? i * 0.003 : 0}s, top 0.5s cubic-bezier(0.16,1,0.3,1) ${aligned ? i * 0.003 : 0}s`,
              }}
            />
          );
        })}
        {phase !== "loading" && (
          <div
            className="absolute top-1/2 left-[10%] h-px -translate-y-1/2"
            style={{
              width: phase === "aligning" || phase === "exit" ? "80%" : "0%",
              background: "var(--line-strong)",
              transition: "width 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s",
            }}
          />
        )}
      </div>

      <p className="font-mono text-xs" style={{ color: "var(--fg-3)" }}>
        {phase === "loading" ? "Booting control loop…" : "Signal locked."}
      </p>
    </motion.div>
  );
}
