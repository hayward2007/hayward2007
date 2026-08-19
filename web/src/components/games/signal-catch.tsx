"use client";

import { useEffect, useRef, useState } from "react";

const WIDTH = 640;
const HEIGHT = 380;
const PADDLE_W = 70;
const PADDLE_H = 12;

type Packet = { x: number; y: number; speed: number; r: number };

export function SignalCatch() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    paddleX: WIDTH / 2,
    packets: [] as Packet[],
    running: false,
    score: 0,
    lives: 3,
    frame: 0,
  });

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem("hk-signal-best") || 0);
    // One-time client-only localStorage read on mount; not derivable during SSR render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBest(stored);
  }, []);

  function start() {
    stateRef.current = { paddleX: WIDTH / 2, packets: [], running: true, score: 0, lives: 3, frame: 0 };
    setScore(0);
    setLives(3);
    setOver(false);
    setStarted(true);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function onMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      stateRef.current.paddleX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    }
    canvas.addEventListener("mousemove", onMove);

    let raf = 0;
    function loop() {
      const s = stateRef.current;
      const styles = getComputedStyle(document.documentElement);
      const fg = styles.getPropertyValue("--fg").trim() || "#111";
      const ai = styles.getPropertyValue("--accent-ai").trim() || "#5b4de0";
      const line = styles.getPropertyValue("--line-strong").trim() || "#ccc";

      ctx!.clearRect(0, 0, WIDTH, HEIGHT);
      ctx!.strokeStyle = line;
      ctx!.beginPath();
      ctx!.moveTo(0, HEIGHT - 4);
      ctx!.lineTo(WIDTH, HEIGHT - 4);
      ctx!.stroke();

      if (s.running) {
        s.frame += 1;
        if (s.frame % Math.max(28, 55 - Math.floor(s.score * 1.5)) === 0) {
          s.packets.push({ x: 20 + Math.random() * (WIDTH - 40), y: -10, speed: 2.2 + Math.random() * 1.6, r: 9 });
        }
        s.packets.forEach((p) => (p.y += p.speed));

        const paddleY = HEIGHT - 26;
        s.packets = s.packets.filter((p) => {
          if (
            p.y > paddleY - p.r &&
            p.y < paddleY + PADDLE_H &&
            p.x > s.paddleX - PADDLE_W / 2 - p.r &&
            p.x < s.paddleX + PADDLE_W / 2 + p.r
          ) {
            s.score += 1;
            setScore(s.score);
            return false;
          }
          if (p.y > HEIGHT + 20) {
            s.lives -= 1;
            setLives(s.lives);
            if (s.lives <= 0) {
              s.running = false;
              setOver(true);
              setBest((prevBest) => {
                const next = Math.max(prevBest, s.score);
                window.localStorage.setItem("hk-signal-best", String(next));
                return next;
              });
            }
            return false;
          }
          return true;
        });
      }

      ctx!.fillStyle = ai;
      s.packets.forEach((p) => {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      });

      ctx!.fillStyle = fg;
      ctx!.fillRect(s.paddleX - PADDLE_W / 2, HEIGHT - 26, PADDLE_W, PADDLE_H);

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      canvas.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border" style={{ borderColor: "var(--line)" }}>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="block w-full cursor-none" />
        {!started && (
          <button
            type="button"
            onClick={start}
            className="absolute inset-0 flex items-center justify-center text-sm"
            style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}
          >
            Move your mouse to catch the packets
          </button>
        )}
        {over && (
          <button
            type="button"
            onClick={start}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm"
            style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}
          >
            <span>Out of lives. Score {score}</span>
            <span style={{ color: "var(--fg-3)" }}>Click to retry</span>
          </button>
        )}
      </div>
      <div className="flex gap-8 font-mono text-sm">
        <span>SCORE {score}</span>
        <span>LIVES {lives}</span>
        <span style={{ color: "var(--fg-3)" }}>BEST {best}</span>
      </div>
    </div>
  );
}
