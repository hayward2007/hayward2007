"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentType } from "react";
import type { EasterEggEffectProps } from "@/components/easter-egg/types";

// Lazy-loaded so matter-js and friends only download once the button is
// actually clicked, not on every single page load for every visitor.
const EFFECTS: ComponentType<EasterEggEffectProps>[] = [
  dynamic(() => import("@/components/easter-egg/gravity-effect").then((m) => m.GravityEffect)),
  dynamic(() => import("@/components/easter-egg/rainbow-effect").then((m) => m.RainbowEffect)),
  dynamic(() => import("@/components/easter-egg/glitch-effect").then((m) => m.GlitchEffect)),
  dynamic(() => import("@/components/easter-egg/zero-gravity-effect").then((m) => m.ZeroGravityEffect)),
  dynamic(() => import("@/components/easter-egg/matrix-rain-effect").then((m) => m.MatrixRainEffect)),
  dynamic(() => import("@/components/easter-egg/confetti-effect").then((m) => m.ConfettiEffect)),
  dynamic(() => import("@/components/easter-egg/converge-effect").then((m) => m.ConvergeEffect)),
  dynamic(() => import("@/components/easter-egg/orbit-effect").then((m) => m.OrbitEffect)),
  dynamic(() => import("@/components/easter-egg/vortex-effect").then((m) => m.VortexEffect)),
  dynamic(() => import("@/components/easter-egg/warp-effect").then((m) => m.WarpEffect)),
  dynamic(() => import("@/components/easter-egg/shockwave-effect").then((m) => m.ShockwaveEffect)),
];

function shuffled<T>(items: T[]): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function EasterEggButton() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [closing, setClosing] = useState(false);
  const [EffectComponent, setEffectComponent] = useState<ComponentType<EasterEggEffectProps> | null>(null);
  const prevPathname = useRef(pathname);
  // A shuffled queue of effect indices — trigger() pops the front instead of
  // picking uniformly at random, so every effect is seen once per cycle before
  // any repeat, and a fresh shuffle never starts with what the last one ended on.
  const queueRef = useRef<number[]>([]);
  const lastIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevPathname.current !== pathname && active) {
      setActive(false);
      setClosing(false);
      setEffectComponent(null);
    }
    prevPathname.current = pathname;
  }, [pathname, active]);

  useEffect(() => {
    document.body.dataset.easterEgg = active ? "1" : "";
  }, [active]);

  if (pathname.startsWith("/admin")) return null;

  function nextIndex(): number {
    if (queueRef.current.length === 0) {
      const shuffle = shuffled(EFFECTS.map((_, i) => i));
      if (lastIndexRef.current !== null && shuffle[0] === lastIndexRef.current && shuffle.length > 1) {
        [shuffle[0], shuffle[1]] = [shuffle[1], shuffle[0]];
      }
      queueRef.current = shuffle;
    }
    const index = queueRef.current.shift()!;
    lastIndexRef.current = index;
    return index;
  }

  function trigger() {
    const pick = EFFECTS[nextIndex()];
    setEffectComponent(() => pick);
    setActive(true);
    setClosing(false);
  }

  function requestClose() {
    setClosing(true);
  }

  function handleFinished() {
    setActive(false);
    setClosing(false);
    setEffectComponent(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={active ? requestClose : trigger}
        disabled={closing}
        data-cursor="true"
        aria-label={active ? "Reset page" : "Trigger a random easter egg"}
        className="fixed bottom-5 right-5 z-[450] flex h-11 items-center justify-center gap-1.5 rounded-full border px-4 font-mono text-[11px] uppercase tracking-[0.08em] shadow-sm transition-transform duration-150 hover:scale-105 disabled:opacity-60"
        style={{ borderColor: "var(--line-strong)", background: "var(--bg-raised)" }}
      >
        {active ? "✕" : "Random Effect"}
      </button>
      {active && EffectComponent && <EffectComponent closing={closing} onFinished={handleFinished} />}
    </>
  );
}
