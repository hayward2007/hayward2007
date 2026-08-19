"use client";

import { useEffect, useRef, useState } from "react";

const WIDTH = 360;
const HEIGHT = 560;
const CAR_Y = HEIGHT - 90;
const TRACK_WIDTH = 96;
const CAR_W = 22;
const CAR_H = 32;
const SEGMENT_H = 18;
const CAR_SPEED = 3.6;

export function LineRacer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    carX: WIDTH / 2,
    segments: [0] as number[], // center-x per world row, index i covers worldY in [i*SEGMENT_H, (i+1)*SEGMENT_H)
    scrollY: 0,
    speed: 1.8,
    running: false,
    keys: new Set<string>(),
  });

  const [distance, setDistance] = useState(0);
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem("hk-line-racer-best") || 0);
    // One-time client-only localStorage read on mount; not derivable during SSR render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBest(stored);
  }, []);

  function start() {
    stateRef.current = {
      carX: WIDTH / 2,
      segments: [WIDTH / 2],
      scrollY: 0,
      speed: 1.8,
      running: true,
      keys: new Set(),
    };
    setDistance(0);
    setOver(false);
    setStarted(true);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function onKeyDown(e: KeyboardEvent) {
      stateRef.current.keys.add(e.key);
    }
    function onKeyUp(e: KeyboardEvent) {
      stateRef.current.keys.delete(e.key);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    function ensureSegmentsUpTo(index: number) {
      const s = stateRef.current;
      while (s.segments.length <= index) {
        const last = s.segments[s.segments.length - 1];
        let cx = last + (Math.random() - 0.5) * 26;
        cx = Math.max(TRACK_WIDTH / 2 + 20, Math.min(WIDTH - TRACK_WIDTH / 2 - 20, cx));
        s.segments.push(cx);
      }
    }

    let raf = 0;
    function loop() {
      const s = stateRef.current;
      const styles = getComputedStyle(document.documentElement);
      const fg = styles.getPropertyValue("--fg").trim() || "#111";
      const track = styles.getPropertyValue("--bg-raised").trim() || "#f4f4f4";
      const signal = styles.getPropertyValue("--accent-signal").trim() || "#e0562c";

      ctx!.clearRect(0, 0, WIDTH, HEIGHT);

      if (s.running) {
        s.speed = Math.min(4.5, 1.8 + s.scrollY * 0.0008);
        s.scrollY += s.speed;
        setDistance(Math.floor(s.scrollY));

        if (s.keys.has("ArrowLeft") || s.keys.has("a")) s.carX -= CAR_SPEED;
        if (s.keys.has("ArrowRight") || s.keys.has("d")) s.carX += CAR_SPEED;
        s.carX = Math.max(CAR_W / 2, Math.min(WIDTH - CAR_W / 2, s.carX));

        // screen_y = CAR_Y + (scrollY - worldY): furthest-ahead track (largest
        // worldY) renders above the fixed car and scrolls down toward it as scrollY grows.
        const topWorldY = CAR_Y + s.scrollY;
        ensureSegmentsUpTo(Math.floor(topWorldY / SEGMENT_H) + 2);

        const carRowIndex = Math.floor(s.scrollY / SEGMENT_H);
        const carCx = s.segments[carRowIndex] ?? WIDTH / 2;
        if (Math.abs(s.carX - carCx) > TRACK_WIDTH / 2 - CAR_W / 2) {
          s.running = false;
          setOver(true);
          setBest((prevBest) => {
            const next = Math.max(prevBest, Math.floor(s.scrollY));
            window.localStorage.setItem("hk-line-racer-best", String(next));
            return next;
          });
        }
      }

      ctx!.fillStyle = track;
      for (let y = 0; y < HEIGHT; y += SEGMENT_H) {
        const worldY = CAR_Y + s.scrollY - y;
        const rowIndex = Math.floor(worldY / SEGMENT_H);
        const cx = rowIndex >= 0 ? s.segments[rowIndex] ?? WIDTH / 2 : WIDTH / 2;
        ctx!.fillRect(cx - TRACK_WIDTH / 2, y, TRACK_WIDTH, SEGMENT_H + 1);
      }

      ctx!.fillStyle = s.running ? fg : signal;
      ctx!.fillRect(s.carX - CAR_W / 2, CAR_Y - CAR_H / 2, CAR_W, CAR_H);

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border select-none"
        style={{ borderColor: "var(--line)" }}
      >
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="block w-full" />
        {!started && (
          <button
            type="button"
            onClick={start}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-sm"
            style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}
          >
            <span>← → (or A / D) to steer</span>
            <span style={{ color: "var(--fg-3)" }}>Click to start</span>
          </button>
        )}
        {over && (
          <button
            type="button"
            onClick={start}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm"
            style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}
          >
            <span>Off the track. Distance {distance}</span>
            <span style={{ color: "var(--fg-3)" }}>Click to retry</span>
          </button>
        )}
      </div>
      <div className="flex gap-8 font-mono text-sm">
        <span>DISTANCE {distance}</span>
        <span style={{ color: "var(--fg-3)" }}>BEST {best}</span>
      </div>
    </div>
  );
}
