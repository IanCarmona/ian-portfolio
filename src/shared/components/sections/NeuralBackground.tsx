"use client";

import React, { useRef } from "react";

import { cn } from "@/utils/cn";
import { useNeuralCanvas } from "@/hooks/useNeuralCanvas";

/** Full-bleed animated neural-network canvas for the hero. */
export function NeuralBackground({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useNeuralCanvas(ref);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("absolute inset-0 h-full w-full", className)}
    />
  );
}
