"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { GravityEffect } from "@/components/easter-egg/gravity-effect";
import { RainbowEffect } from "@/components/easter-egg/rainbow-effect";
import { GlitchEffect } from "@/components/easter-egg/glitch-effect";
import { ZeroGravityEffect } from "@/components/easter-egg/zero-gravity-effect";
import { MatrixRainEffect } from "@/components/easter-egg/matrix-rain-effect";
import { ConfettiEffect } from "@/components/easter-egg/confetti-effect";
import type { EasterEggEffectProps } from "@/components/easter-egg/types";

// One is picked at random each time the button is pressed.
const EFFECTS: ComponentType<EasterEggEffectProps>[] = [
  GravityEffect,
  RainbowEffect,
  GlitchEffect,
  ZeroGravityEffect,
  MatrixRainEffect,
  ConfettiEffect,
];

export function EasterEggButton() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [closing, setClosing] = useState(false);
  const [EffectComponent, setEffectComponent] = useState<ComponentType<EasterEggEffectProps> | null>(null);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // Navigating away mid-effect: the page's own DOM is about to be torn
    // down regardless, so cut straight to a hard reset instead of running
    // the graceful fly-back — there's nothing left to animate back onto.
    if (prevPathname.current !== pathname && active) {
      setActive(false);
      setClosing(false);
      setEffectComponent(null);
    }
    prevPathname.current = pathname;
  }, [pathname, active]);

  useEffect(() => {
    // TiltCard rewrites its own ancestor's transform on every mousemove,
    // which undoes the one-time containing-block neutralization Gravity/
    // ZeroGravity did at mount — re-clipping their now-fixed-position cards
    // the instant the pointer re-enters one. Freezing tilt for the whole
    // active+closing window sidesteps that instead of patching every effect.
    document.body.dataset.easterEgg = active ? "1" : "";
  }, [active]);

  if (pathname.startsWith("/admin")) return null;

  function trigger() {
    const pick = EFFECTS[Math.floor(Math.random() * EFFECTS.length)];
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
