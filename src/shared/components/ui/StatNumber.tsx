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
  className?: string;
}

/** Number that counts up from 0 when scrolled into view. */
export function StatNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: StatNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const current = useCountUp(value, { enabled: inView });

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {current.toFixed(decimals)}
      {suffix}
    </span>
  );
}
