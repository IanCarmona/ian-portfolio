"use client";

import React, { useRef } from "react";
import { useInView } from "framer-motion";

import { cn } from "@/utils/cn";
import { useCountUp } from "@/hooks/useCountUp";

interface StatNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  /** Decimals to display (e.g. for non-integers). */
  decimals?: number;
  /** Count up on mount rather than on scroll — for stats at or near the fold. */
  eager?: boolean;
  className?: string;
}

/** Number that counts up from 0 when scrolled into view. */
export function StatNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  eager = false,
  className,
}: StatNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  // Trigger 120px before the element enters, so the count-up is already running
  // by the time it is readable. The previous "-60px" shrank the root instead,
  // and never fired for anything sitting at the edge of the viewport.
  const inView = useInView(ref, { once: true, margin: "0px 0px 120px 0px" });
  const current = useCountUp(value, { enabled: eager || inView });

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {current.toFixed(decimals)}
      {suffix}
    </span>
  );
}
