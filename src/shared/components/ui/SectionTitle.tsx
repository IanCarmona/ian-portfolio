import React from "react";

import { cn } from "@/utils/cn";
import { Reveal } from "./Reveal";

interface SectionTitleProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

/** Eyebrow + heading + subtitle block with a gradient eyebrow rule. */
export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: SectionTitleProps) {
  const centered = align === "center";
  return (
    <Reveal className={cn("max-w-2xl", centered && "mx-auto text-center", className)}>
      {eyebrow && (
        <div
          className={cn(
            "mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-indigo",
            centered && "justify-center",
          )}
        >
          <span className="h-px w-8 bg-gradient-to-r from-indigo to-cyan" />
          {eyebrow}
        </div>
      )}
      <h2 className="font-serif text-3xl font-semibold tracking-tight text-text sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-text-dim">{subtitle}</p>}
    </Reveal>
  );
}
