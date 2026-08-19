"use client";

import { useEffect, useRef, useState } from "react";

const GROUND_Y = 150;
const GRAVITY = 0.9;
const JUMP_VELOCITY = -14;
const ROVER_X = 40;
const ROVER_SIZE = 22;

type Obstacle = { x: number; w: number; h: number };

export function RoverRun() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    y: 0,
    vy: 0,
    jumping: false,
    obstacles: [] as Obstacle[],
    speed: 5,
    frame: 0,
    running: false,
    score: 0,
  });
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem("hk-rover-best") || 0);
    // One-time client-only localStorage read on mount; not derivable during SSR render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBest(stored);
  }, []);

  function reset() {
    stateRef.current = { y: 0, vy: 0, jumping: false, obstacles: [], speed: 5, frame: 0, running: true, score: 0 };
    setGameOver(false);
    setScore(0);
    setStarted(true);
  }

  function jump() {
    const s = stateRef.current;
    if (!s.running) return;
    if (!s.jumping) {
      s.vy = JUMP_VELOCITY;
      s.jumping = true;
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;

    function loop() {
      const s = stateRef.current;
      const width = canvas!.width;
      const height = canvas!.height;
      ctx!.clearRect(0, 0, width, height);

      const styles = getComputedStyle(document.documentElement);
      const fg = styles.getPropertyValue("--fg").trim() || "#111";
      const accent = styles.getPropertyValue("--accent-robotics").trim() || "#0e8f7c";
      const line = styles.getPropertyValue("--line-strong").trim() || "#ccc";

      // ground
      ctx!.strokeStyle = line;
      ctx!.beginPath();
      ctx!.moveTo(0, GROUND_Y);
      ctx!.lineTo(width, GROUND_Y);
      ctx!.stroke();

      if (s.running) {
        s.frame += 1;
        s.vy += GRAVITY;
        s.y += s.vy;
        if (s.y > 0) {
          s.y = 0;
          s.vy = 0;
          s.jumping = false;
        }

        if (s.frame % Math.max(40, 70 - Math.floor(s.speed * 3)) === 0) {
          const h = 18 + Math.random() * 20;
          s.obstacles.push({ x: width, w: 12 + Math.random() * 10, h });
        }
        s.obstacles.forEach((o) => (o.x -= s.speed));
        s.obstacles = s.obstacles.filter((o) => o.x + o.w > 0);
        s.speed += 0.0025;
        s.score += 1;
        setScore(Math.floor(s.score / 5));

        const roverTop = GROUND_Y - ROVER_SIZE + s.y;
        for (const o of s.obstacles) {
          const oTop = GROUND_Y - o.h;
          const hit =
            ROVER_X + ROVER_SIZE * 0.7 > o.x &&
            ROVER_X < o.x + o.w &&
            roverTop + ROVER_SIZE > oTop;
          if (hit) {
            s.running = false;
            setGameOver(true);
            const finalScore = Math.floor(s.score / 5);
            setBest((prevBest) => {
              const next = Math.max(prevBest, finalScore);
              window.localStorage.setItem("hk-rover-best", String(next));
              return next;
            });
          }
        }
      }

      // rover (simple robot glyph)
      const roverTop = GROUND_Y - ROVER_SIZE + s.y;
      ctx!.fillStyle = accent;
      ctx!.fillRect(ROVER_X, roverTop, ROVER_SIZE, ROVER_SIZE);
      ctx!.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#fff";
      ctx!.fillRect(ROVER_X + 5, roverTop + 5, 5, 5);
      ctx!.fillRect(ROVER_X + 12, roverTop + 5, 5, 5);

      // obstacles
      ctx!.fillStyle = fg;
      for (const o of s.obstacles) {
        ctx!.fillRect(o.x, GROUND_Y - o.h, o.w, o.h);
      }

      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (!stateRef.current.running) reset();
        else jump();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative w-full max-w-xl cursor-pointer overflow-hidden rounded-2xl border"
        style={{ borderColor: "var(--line)" }}
        onClick={() => (started ? jump() : reset())}
      >
        <canvas ref={canvasRef} width={640} height={200} className="block w-full" />
        {!started && (
          <div className="absolute inset-0 flex items-center justify-center text-sm" style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}>
            Tap or press Space to start
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm" style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}>
            <p>Signal lost. Score {score}</p>
            <p style={{ color: "var(--fg-3)" }}>Tap or press Space to retry</p>
          </div>
        )}
      </div>
      <div className="flex gap-8 font-mono text-sm">
        <span>SCORE {score}</span>
        <span style={{ color: "var(--fg-3)" }}>BEST {best}</span>
      </div>
    </div>
  );
}
