"use client";

import { useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

interface Options {
  speed?: number;
  startDelay?: number;
  enabled?: boolean;
}

/**
 * Types `lines` out character by character (joined with newlines).
 * Returns the partial text and whether typing has finished.
 */
export function useTypewriter(
  lines: string[],
  { speed = 28, startDelay = 300, enabled = true }: Options = {},
) {
  const full = lines.join("\n");
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const reduced = usePrefersReducedMotion();
  const started = useRef(false);

  useEffect(() => {
    if (!enabled || started.current) return;
    started.current = true;

    if (reduced) {
      setText(full);
      setDone(true);
      return;
    }

    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const type = () => {
      if (i <= full.length) {
        setText(full.slice(0, i));
        i += 1;
        timeout = setTimeout(type, speed);
      } else {
        setDone(true);
      }
    };

    timeout = setTimeout(type, startDelay);
    return () => clearTimeout(timeout);
  }, [enabled, full, speed, startDelay, reduced]);

  return { text, done };
}
