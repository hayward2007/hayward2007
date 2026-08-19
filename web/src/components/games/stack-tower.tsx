"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

const WIDTH = 360;
const HEIGHT = 560;
const GROUND_Y = 520;
const BLOCK_W = 74;
const BLOCK_H = 28;
const GAP = 4;

type GameState = {
  engine: Matter.Engine;
  ground: Matter.Body;
  blocks: Matter.Body[];
  ghostX: number;
  ghostY: number;
  swayT: number;
  swaySpeed: number;
  swayRange: number;
  dropped: Matter.Body | null;
  droppedAt: number;
  cameraOffset: number;
  running: boolean;
  frame: number;
};

export function StackTower() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Deliberately not constructed until start() — building a real Matter engine
  // eagerly here ran on every render (useRef's initializer argument is evaluated
  // each time even though only the first call is kept) and was heavy enough to
  // delay this component becoming genuinely interactive right after mount.
  const stateRef = useRef<GameState | null>(null);

  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem("hk-stack-best") || 0);
    // One-time client-only localStorage read on mount; not derivable during SSR render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBest(stored);
  }, []);

  function start() {
    const engine = Matter.Engine.create();
    const ground = Matter.Bodies.rectangle(WIDTH / 2, GROUND_Y + 20, WIDTH * 2, 40, { isStatic: true, friction: 0.9 });
    Matter.Composite.add(engine.world, ground);
    stateRef.current = {
      engine,
      ground,
      blocks: [],
      ghostX: WIDTH / 2,
      ghostY: GROUND_Y - BLOCK_H - GAP,
      swayT: 0,
      swaySpeed: 0.045,
      swayRange: 110,
      dropped: null,
      droppedAt: 0,
      cameraOffset: 0,
      running: true,
      frame: 0,
    };
    setScore(0);
    setOver(false);
    setStarted(true);
  }

  function drop() {
    const s = stateRef.current;
    if (!s || !s.running || s.dropped) return;
    const body = Matter.Bodies.rectangle(s.ghostX, s.ghostY, BLOCK_W, BLOCK_H, {
      friction: 0.85,
      restitution: 0.02,
      frictionAir: 0.001,
    });
    Matter.Composite.add(s.engine.world, body);
    s.blocks.push(body);
    s.dropped = body;
    s.droppedAt = s.frame;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    function loop() {
      const s = stateRef.current;
      const styles = getComputedStyle(document.documentElement);
      const fg = styles.getPropertyValue("--fg").trim() || "#111";
      const accent = styles.getPropertyValue("--accent-robotics").trim() || "#0e8f7c";
      const signal = styles.getPropertyValue("--accent-signal").trim() || "#e0562c";
      const line = styles.getPropertyValue("--line-strong").trim() || "#ccc";

      if (s && s.running) {
        s.frame += 1;
        Matter.Engine.update(s.engine, 1000 / 60);

        if (!s.dropped) {
          s.swayT += s.swaySpeed;
          s.ghostX = WIDTH / 2 + Math.sin(s.swayT) * s.swayRange;
        } else if (s.frame - s.droppedAt > 70) {
          // Settled: judge whether it landed reasonably aligned on the stack.
          // A "resting" body still carries tiny residual jitter from the solver — it
          // may never cross an overly strict speed threshold — so this also forces
          // the check after a hard timeout regardless of speed, to guarantee the game
          // always progresses instead of silently freezing after one drop.
          const speed = Math.hypot(s.dropped.velocity.x, s.dropped.velocity.y);
          const forceSettle = s.frame - s.droppedAt > 130;
          if (speed < 1.2 || forceSettle) {
            const support = s.blocks.length > 1 ? s.blocks[s.blocks.length - 2] : s.ground;
            const dx = Math.abs(s.dropped.position.x - support.position.x);
            const tooTilted = Math.abs(s.dropped.angle) > 0.55;
            if (dx > BLOCK_W * 0.75 || tooTilted || s.dropped.position.y > GROUND_Y + 80) {
              s.running = false;
              setOver(true);
              setBest((prevBest) => {
                const next = Math.max(prevBest, s.blocks.length - 1);
                window.localStorage.setItem("hk-stack-best", String(next));
                return next;
              });
            } else {
              setScore(s.blocks.length);
              s.ghostY = s.dropped.position.y - BLOCK_H - GAP;
              s.swayRange = Math.max(50, 110 - s.blocks.length * 3);
              s.swaySpeed = Math.min(0.09, 0.045 + s.blocks.length * 0.003);
              s.dropped = null;
            }
          }
        }

        const targetCamera = Math.max(0, GROUND_Y - s.ghostY - (HEIGHT - 160));
        s.cameraOffset += (targetCamera - s.cameraOffset) * 0.08;
      }

      ctx!.clearRect(0, 0, WIDTH, HEIGHT);

      if (s) {
        const toScreenY = (worldY: number) => worldY - s.cameraOffset;

        ctx!.fillStyle = line;
        ctx!.fillRect(0, toScreenY(GROUND_Y + 4), WIDTH, 4);

        ctx!.fillStyle = fg;
        s.blocks.forEach((b, i) => {
          ctx!.save();
          ctx!.translate(b.position.x, toScreenY(b.position.y));
          ctx!.rotate(b.angle);
          ctx!.fillStyle = i === s.blocks.length - 1 && s.dropped ? signal : fg;
          ctx!.fillRect(-BLOCK_W / 2, -BLOCK_H / 2, BLOCK_W, BLOCK_H);
          ctx!.restore();
        });

        if (s.running && !s.dropped) {
          ctx!.globalAlpha = 0.55;
          ctx!.fillStyle = accent;
          ctx!.fillRect(s.ghostX - BLOCK_W / 2, toScreenY(s.ghostY) - BLOCK_H / 2, BLOCK_W, BLOCK_H);
          ctx!.globalAlpha = 1;
        }
      }

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative w-full max-w-sm cursor-pointer overflow-hidden rounded-2xl border select-none"
        style={{ borderColor: "var(--line)" }}
        onClick={() => (started && !over ? drop() : start())}
      >
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="block w-full" />
        {!started && (
          <div className="absolute inset-0 flex items-center justify-center text-center text-sm" style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}>
            Click to drop each block on the stack
          </div>
        )}
        {over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm" style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}>
            <span>Tower toppled. Height {score}</span>
            <span style={{ color: "var(--fg-3)" }}>Click to rebuild</span>
          </div>
        )}
      </div>
      <div className="flex gap-8 font-mono text-sm">
        <span>HEIGHT {score}</span>
        <span style={{ color: "var(--fg-3)" }}>BEST {best}</span>
      </div>
    </div>
  );
}
