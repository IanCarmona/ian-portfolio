"use client";

import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

interface Options {
  duration?: number;
  /** Start the animation only when true (e.g. when scrolled into view). */
  enabled?: boolean;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Animate a number from 0 to `target` once `enabled` becomes true. */
export function useCountUp(target: number, { duration = 1600, enabled = true }: Options = {}) {
  const [value, setValue] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!enabled) return;

    if (reduced) {
      setValue(target);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(target * easeOutCubic(progress));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Deliberately no run-once guard: `reduced` resolves to its real value one
    // tick after mount, which re-runs this effect. A guard would skip the body
    // while the cleanup below had already cancelled the frame, freezing the
    // display at 0. Restarting the tween is cheap and always lands on `target`.
    return () => cancelAnimationFrame(raf);
  }, [enabled, target, duration, reduced]);

  return value;
}
