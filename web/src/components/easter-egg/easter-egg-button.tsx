"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { Dices, LoaderCircle, X } from "lucide-react";
import type { EasterEggEffectProps } from "@/components/easter-egg/types";
import { getVisiblePhysicsContext } from "@/components/easter-egg/targets";

type EffectDefinition = {
  id: string;
  label: string;
  needsPhysicsTargets?: boolean;
  load: () => Promise<ComponentType<EasterEggEffectProps>>;
};

// Imports stay lazy so effect code, including matter-js, is only requested
// after the visitor asks for it.
const EFFECTS: EffectDefinition[] = [
  {
    id: "gravity",
    label: "Gravity",
    needsPhysicsTargets: true,
    load: () => import("@/components/easter-egg/gravity-effect").then((m) => m.GravityEffect),
  },
  {
    id: "rainbow",
    label: "Rainbow",
    needsPhysicsTargets: true,
    load: () => import("@/components/easter-egg/rainbow-effect").then((m) => m.RainbowEffect),
  },
  {
    id: "glitch",
    label: "Glitch",
    needsPhysicsTargets: true,
    load: () => import("@/components/easter-egg/glitch-effect").then((m) => m.GlitchEffect),
  },
  {
    id: "zero-gravity",
    label: "Zero gravity",
    needsPhysicsTargets: true,
    load: () => import("@/components/easter-egg/zero-gravity-effect").then((m) => m.ZeroGravityEffect),
  },
  {
    id: "matrix-rain",
    label: "Matrix rain",
    load: () => import("@/components/easter-egg/matrix-rain-effect").then((m) => m.MatrixRainEffect),
  },
  {
    id: "confetti",
    label: "Confetti",
    load: () => import("@/components/easter-egg/confetti-effect").then((m) => m.ConfettiEffect),
  },
  {
    id: "converge",
    label: "Converge",
    needsPhysicsTargets: true,
    load: () => import("@/components/easter-egg/converge-effect").then((m) => m.ConvergeEffect),
  },
  {
    id: "orbit",
    label: "Orbit",
    needsPhysicsTargets: true,
    load: () => import("@/components/easter-egg/orbit-effect").then((m) => m.OrbitEffect),
  },
  {
    id: "vortex",
    label: "Vortex",
    load: () => import("@/components/easter-egg/vortex-effect").then((m) => m.VortexEffect),
  },
  {
    id: "warp",
    label: "Warp speed",
    load: () => import("@/components/easter-egg/warp-effect").then((m) => m.WarpEffect),
  },
  {
    id: "shockwave",
    label: "Shockwave",
    needsPhysicsTargets: true,
    load: () => import("@/components/easter-egg/shockwave-effect").then((m) => m.ShockwaveEffect),
  },
];

const FALLBACK_EFFECT = EFFECTS.find((effect) => effect.id === "confetti")!;

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
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [activeEffect, setActiveEffect] = useState<EffectDefinition | null>(null);
  const [EffectComponent, setEffectComponent] = useState<ComponentType<EasterEggEffectProps> | null>(null);
  const prevPathname = useRef(pathname);
  const loadRequestRef = useRef(0);
  const queueRef = useRef<string[]>([]);
  const lastIdRef = useRef<string | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      loadRequestRef.current += 1;
      queueRef.current = [];
      setActive(false);
      setLoading(false);
      setClosing(false);
      setActiveEffect(null);
      setEffectComponent(null);
      busyRef.current = false;
    }
    prevPathname.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (active) document.body.dataset.easterEgg = "1";
    else delete document.body.dataset.easterEgg;

    return () => {
      delete document.body.dataset.easterEgg;
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !closing) setClosing(true);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, closing]);

  if (pathname.startsWith("/admin")) return null;

  function compatibleEffects(): EffectDefinition[] {
    const hasPhysicsTargets = getVisiblePhysicsContext(1).targets.length > 0;
    return EFFECTS.filter((effect) => !effect.needsPhysicsTargets || hasPhysicsTargets);
  }

  function nextEffect(): EffectDefinition {
    const available = compatibleEffects();
    const availableIds = new Set(available.map((effect) => effect.id));
    queueRef.current = queueRef.current.filter((id) => availableIds.has(id));

    if (queueRef.current.length === 0) {
      const queue = shuffled(available.map((effect) => effect.id));
      if (lastIdRef.current !== null && queue[0] === lastIdRef.current && queue.length > 1) {
        [queue[0], queue[1]] = [queue[1], queue[0]];
      }
      queueRef.current = queue;
    }

    const id = queueRef.current.shift()!;
    lastIdRef.current = id;
    return available.find((effect) => effect.id === id) ?? FALLBACK_EFFECT;
  }

  async function trigger() {
    if (busyRef.current || active || loading || closing) return;
    busyRef.current = true;
    const requestId = ++loadRequestRef.current;
    let effect = nextEffect();

    setLoading(true);
    setActiveEffect(effect);

    try {
      let component: ComponentType<EasterEggEffectProps>;
      try {
        component = await effect.load();
      } catch {
        effect = FALLBACK_EFFECT;
        component = await FALLBACK_EFFECT.load();
      }

      if (loadRequestRef.current !== requestId) return;
      setActiveEffect(effect);
      setEffectComponent(() => component);
      setActive(true);
      setClosing(false);
    } catch {
      if (loadRequestRef.current !== requestId) return;
      setActiveEffect(null);
      setEffectComponent(null);
    } finally {
      if (loadRequestRef.current === requestId) {
        setLoading(false);
        busyRef.current = false;
      }
    }
  }

  function requestClose() {
    if (closing) return;
    setClosing(true);
  }

  function handleFinished() {
    setActive(false);
    setClosing(false);
    setActiveEffect(null);
    setEffectComponent(null);
    busyRef.current = false;
  }

  const buttonLabel = loading
    ? "Loading random effect"
    : active
      ? `Reset ${activeEffect?.label ?? "page"} effect`
      : "Trigger a random easter egg";

  return (
    <>
      <button
        type="button"
        onClick={active ? requestClose : trigger}
        disabled={loading || closing}
        data-cursor="true"
        data-effect={activeEffect?.id}
        aria-label={buttonLabel}
        title={active ? "Reset effect" : "Random effect"}
        className="fixed bottom-5 right-5 z-[450] flex h-11 w-11 items-center justify-center rounded-full border shadow-sm transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-60"
        style={{ borderColor: "var(--line-strong)", background: "var(--bg-raised)" }}
      >
        {loading || closing ? (
          <LoaderCircle className="animate-spin" size={17} aria-hidden="true" />
        ) : active ? (
          <X size={17} aria-hidden="true" />
        ) : (
          <Dices size={17} aria-hidden="true" />
        )}
      </button>
      {(loading || active) && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-6 right-[4.75rem] z-[450] rounded-md border px-3 py-2 text-xs shadow-sm"
          style={{ borderColor: "var(--line-strong)", background: "var(--bg-raised)", color: "var(--fg-2)" }}
        >
          {loading ? "Loading effect" : activeEffect?.label}
        </div>
      )}
      {active && EffectComponent && <EffectComponent closing={closing} onFinished={handleFinished} />}
    </>
  );
}
