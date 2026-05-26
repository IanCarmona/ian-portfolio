"use client";

import React from "react";
import { motion } from "framer-motion";

import { cn } from "@/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Adds a subtle gradient hairline border. */
  gradientBorder?: boolean;
  /** Lift + glow on hover. */
  interactive?: boolean;
}

/** Surface card matching the dark token system. */
export function Card({ children, className, gradientBorder, interactive }: CardProps) {
  return (
    <motion.div
      whileHover={interactive ? { y: -4 } : undefined}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "rounded-2xl bg-surface/80 p-6",
        gradientBorder ? "border-gradient" : "border border-border",
        interactive &&
          "transition-shadow duration-300 hover:shadow-[0_24px_60px_-30px_rgba(139,92,246,0.5)]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
