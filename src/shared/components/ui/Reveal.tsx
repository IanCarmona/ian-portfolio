"use client";

import React from "react";
import { motion } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  /** Stagger delay in seconds. */
  delay?: number;
  /** Travel distance in px. */
  y?: number;
  className?: string;
  as?: "div" | "li" | "span" | "section";
}

/** Scroll-triggered fade/slide reveal (wraps framer-motion whileInView). */
export function Reveal({ children, delay = 0, y = 24, className, as = "div" }: RevealProps) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </MotionTag>
  );
}
