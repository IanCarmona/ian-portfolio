import React from "react";

import { cn } from "@/utils/cn";

/** Small skill / stack chip. */
export function Tag({
  children,
  accent = "neutral",
  className,
}: {
  children: React.ReactNode;
  accent?: "indigo" | "cyan" | "neutral";
  className?: string;
}) {
  const styles = {
    indigo: "border-indigo/30 text-indigo bg-indigo/10",
    cyan: "border-cyan/30 text-cyan bg-cyan/10",
    neutral: "border-border text-text-dim bg-surface-2/60",
  }[accent];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        styles,
        className,
      )}
    >
      {children}
    </span>
  );
}
