"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // native scroll on touch

    const lenis = new Lenis({
      // Short and close to linear: the point is to still get the very brief,
      // sub-100ms glide that keeps trackpad flicks from feeling clipped, without
      // the wheel input trailing noticeably behind the pointer — a longer
      // duration/curvier easing here is exactly what read as "답답해" (stuffy).
      duration: 0.18,
      easing: (t) => t,
      wheelMultiplier: 1.7,
    });

    let raf = 0;
    function loop(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
