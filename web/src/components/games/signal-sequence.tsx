"use client";

import { useEffect, useRef, useState } from "react";

const PADS = [
  { id: 0, color: "var(--accent-robotics)" },
  { id: 1, color: "var(--accent-ai)" },
  { id: 2, color: "var(--accent-signal)" },
  { id: 3, color: "var(--fg)" },
] as const;

const STEP_MS = 650;
const FLASH_MS = 400;

type Phase = "idle" | "playing" | "input" | "over";

export function SignalSequence() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userIndex, setUserIndex] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem("hk-sequence-best") || 0);
    // One-time client-only localStorage read on mount; not derivable during SSR render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBest(stored);
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  function clearTimers() {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }

  function playSequence(seq: number[]) {
    setPhase("playing");
    seq.forEach((pad, i) => {
      timersRef.current.push(
        window.setTimeout(() => setActive(pad), i * STEP_MS),
        window.setTimeout(() => setActive(null), i * STEP_MS + FLASH_MS),
      );
    });
    timersRef.current.push(
      window.setTimeout(() => {
        setUserIndex(0);
        setPhase("input");
      }, seq.length * STEP_MS),
    );
  }

  function start() {
    clearTimers();
    // A fresh random pad per round is the entire point of the game — not a
    // render-purity concern, since this only ever runs from a click handler.
    // eslint-disable-next-line react-hooks/purity
    const first = [Math.floor(Math.random() * PADS.length)];
    setSequence(first);
    setScore(0);
    setPhase("idle");
    timersRef.current.push(window.setTimeout(() => playSequence(first), 400));
  }

  function press(padId: number) {
    if (phase !== "input") return;
    if (padId !== sequence[userIndex]) {
      clearTimers();
      setPhase("over");
      setBest((prevBest) => {
        const next = Math.max(prevBest, score);
        window.localStorage.setItem("hk-sequence-best", String(next));
        return next;
      });
      return;
    }
    setActive(padId);
    timersRef.current.push(window.setTimeout(() => setActive(null), 150));

    if (userIndex + 1 === sequence.length) {
      const nextScore = score + 1;
      setScore(nextScore);
      // eslint-disable-next-line react-hooks/purity
      const next = [...sequence, Math.floor(Math.random() * PADS.length)];
      setSequence(next);
      setPhase("playing");
      timersRef.current.push(window.setTimeout(() => playSequence(next), 500));
    } else {
      setUserIndex((v) => v + 1);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative grid w-full max-w-xs grid-cols-2 gap-3">
        {PADS.map((pad) => (
          <button
            key={pad.id}
            type="button"
            onClick={() => press(pad.id)}
            disabled={phase !== "input"}
            className="aspect-square rounded-2xl border transition-transform duration-100"
            style={{
              borderColor: "var(--line-strong)",
              background: active === pad.id ? pad.color : "var(--bg-raised)",
              transform: active === pad.id ? "scale(0.95)" : "scale(1)",
            }}
          />
        ))}
        {(phase === "idle" || phase === "over") && (
          <button
            type="button"
            onClick={start}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl text-center text-sm"
            style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}
          >
            {phase === "over" ? (
              <>
                <span>Wrong signal. Score {score}</span>
                <span style={{ color: "var(--fg-3)" }}>Click to retry</span>
              </>
            ) : (
              <span>Watch the sequence, then repeat it</span>
            )}
          </button>
        )}
      </div>
      <div className="flex gap-8 font-mono text-sm">
        <span>SCORE {score}</span>
        <span style={{ color: "var(--fg-3)" }}>BEST {best}</span>
      </div>
    </div>
  );
}
