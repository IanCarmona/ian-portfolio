"use client";

import React from "react";
import { motion } from "framer-motion";

import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium " +
  "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg " +
  "disabled:opacity-50 disabled:pointer-events-none";

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const variants: Record<Variant, string> = {
  primary:
    "text-white bg-gradient-to-r from-indigo to-cyan shadow-[0_8px_30px_-8px_rgba(139,92,246,0.6)] hover:shadow-[0_12px_40px_-8px_rgba(34,211,238,0.55)] hover:brightness-110",
  secondary:
    "text-text bg-surface-2/60 border border-border hover:border-indigo/60 hover:bg-surface-2",
  ghost: "text-text-dim hover:text-text hover:bg-surface-2/60",
};

function classesFor(variant: Variant, size: Size, className?: string) {
  return cn(base, sizes[size], variants[variant], className);
}

/** Anchor-styled button (most CTAs link to sections / external profiles). */
export function ButtonLink({
  href,
  external,
  variant = "primary",
  size = "md",
  className,
  children,
}: BaseProps & { href: string; external?: boolean }) {
  return (
    <motion.a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={classesFor(variant, size, className)}
    >
      {children}
    </motion.a>
  );
}

/** Native button for in-page actions (e.g. language toggle). */
export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={classesFor(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
