"use client";

import { useEffect, useRef, useState } from "react";

const WIDTH = 640;
const HEIGHT = 380;
const SHOULDER = { x: WIDTH / 2, y: HEIGHT - 20 };
const L1 = 130;
const L2 = 110;
const GAME_SECONDS = 30;

function solveIk(targetX: number, targetY: number) {
  const dx = targetX - SHOULDER.x;
  const dy = targetY - SHOULDER.y;
  let d = Math.hypot(dx, dy);
  d = Math.min(Math.max(d, Math.abs(L1 - L2) + 1), L1 + L2 - 1);

  const a = Math.acos(Math.min(1, Math.max(-1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
  const theta1 = Math.atan2(dy, dx) - a;
  const theta2 = Math.PI - Math.acos(Math.min(1, Math.max(-1, (L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2))));

  const elbow = { x: SHOULDER.x + L1 * Math.cos(theta1), y: SHOULDER.y + L1 * Math.sin(theta1) };
  const hand = { x: elbow.x + L2 * Math.cos(theta1 + theta2), y: elbow.y + L2 * Math.sin(theta1 + theta2) };
  return { elbow, hand };
}

export function ArmReach() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: WIDTH / 2, y: HEIGHT / 2 });
  const targetRef = useRef({ x: WIDTH / 2, y: 120, r: 26 });
  const stateRef = useRef({ running: false, score: 0, timeLeft: GAME_SECONDS });

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem("hk-arm-best") || 0);
    // One-time client-only localStorage read on mount; not derivable during SSR render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBest(stored);
  }, []);

  function spawnTarget() {
    targetRef.current = {
      x: 80 + Math.random() * (WIDTH - 160),
      y: 40 + Math.random() * 180,
      r: Math.max(14, 26 - stateRef.current.score * 0.4),
    };
  }

  function start() {
    stateRef.current = { running: true, score: 0, timeLeft: GAME_SECONDS };
    setScore(0);
    setTimeLeft(GAME_SECONDS);
    setOver(false);
    setStarted(true);
    spawnTarget();
  }

  useEffect(() => {
    if (!started || over) return;
    const timer = setInterval(() => {
      stateRef.current.timeLeft -= 1;
      setTimeLeft(stateRef.current.timeLeft);
      if (stateRef.current.timeLeft <= 0) {
        stateRef.current.running = false;
        setOver(true);
        setBest((prevBest) => {
          const next = Math.max(prevBest, stateRef.current.score);
          window.localStorage.setItem("hk-arm-best", String(next));
          return next;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [started, over]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function onMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * WIDTH,
        y: ((e.clientY - rect.top) / rect.height) * HEIGHT,
      };
    }
    function onClick() {
      if (!stateRef.current.running) return;
      const { hand } = solveIk(mouseRef.current.x, mouseRef.current.y);
      const t = targetRef.current;
      if (Math.hypot(hand.x - t.x, hand.y - t.y) < t.r) {
        stateRef.current.score += 1;
        setScore(stateRef.current.score);
        spawnTarget();
      }
    }
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("click", onClick);

    let raf = 0;
    function loop() {
      const styles = getComputedStyle(document.documentElement);
      const fg = styles.getPropertyValue("--fg").trim() || "#111";
      const accent = styles.getPropertyValue("--accent-robotics").trim() || "#0e8f7c";
      const signal = styles.getPropertyValue("--accent-signal").trim() || "#e0562c";
      const line = styles.getPropertyValue("--line").trim() || "#eee";

      ctx!.clearRect(0, 0, WIDTH, HEIGHT);
      ctx!.fillStyle = line;
      ctx!.fillRect(0, HEIGHT - 6, WIDTH, 6);

      const { elbow, hand } = solveIk(mouseRef.current.x, mouseRef.current.y);

      if (stateRef.current.running) {
        const t = targetRef.current;
        ctx!.beginPath();
        ctx!.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx!.fillStyle = signal;
        ctx!.globalAlpha = 0.18;
        ctx!.fill();
        ctx!.globalAlpha = 1;
        ctx!.lineWidth = 1.5;
        ctx!.strokeStyle = signal;
        ctx!.stroke();
      }

      ctx!.lineWidth = 10;
      ctx!.lineCap = "round";
      ctx!.strokeStyle = fg;
      ctx!.beginPath();
      ctx!.moveTo(SHOULDER.x, SHOULDER.y);
      ctx!.lineTo(elbow.x, elbow.y);
      ctx!.lineTo(hand.x, hand.y);
      ctx!.stroke();

      ctx!.fillStyle = accent;
      [SHOULDER, elbow].forEach((p) => {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx!.fill();
      });
      ctx!.beginPath();
      ctx!.arc(hand.x, hand.y, 8, 0, Math.PI * 2);
      ctx!.fill();

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border" style={{ borderColor: "var(--line)" }}>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="block w-full cursor-crosshair" />
        {!started && (
          <button
            type="button"
            onClick={start}
            className="absolute inset-0 flex items-center justify-center text-sm"
            style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}
          >
            Move the arm with your mouse, click the target
          </button>
        )}
        {over && (
          <button
            type="button"
            onClick={start}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm"
            style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}
          >
            <span>Time&apos;s up. Score {score}</span>
            <span style={{ color: "var(--fg-3)" }}>Click to retry</span>
          </button>
        )}
      </div>
      <div className="flex gap-8 font-mono text-sm">
        <span>SCORE {score}</span>
        <span>TIME {timeLeft}</span>
        <span style={{ color: "var(--fg-3)" }}>BEST {best}</span>
      </div>
    </div>
  );
}
