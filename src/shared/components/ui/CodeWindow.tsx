"use client";

import React, { useRef } from "react";
import { useInView } from "framer-motion";

import { cn } from "@/utils/cn";
import { useTypewriter } from "@/hooks/useTypewriter";

interface CodeWindowProps {
  title?: string;
  lines: string[];
  className?: string;
}

/** macOS-style terminal window that types its content on view. */
export function CodeWindow({ title = "ian@portfolio: ~", lines, className }: CodeWindowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { text, done } = useTypewriter(lines, { enabled: inView });

  return (
    <div
      ref={ref}
      className={cn(
        "border-gradient overflow-hidden rounded-2xl bg-[#0a0c11] shadow-[0_30px_80px_-40px_rgba(34,211,238,0.4)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/70 bg-surface-2/50 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-xs text-text-faint">{title}</span>
      </div>
      <pre className="min-h-[220px] whitespace-pre-wrap p-5 font-mono text-[13px] leading-relaxed text-text">
        {renderColored(text)}
        {!done && <span className="cursor-blink text-cyan">▋</span>}
      </pre>
    </div>
  );
}

/** Tiny syntax flavor: highlight prompts, flags and check marks. */
function renderColored(text: string) {
  return text.split("\n").map((line, i) => {
    let className = "text-text";
    if (line.startsWith("$")) className = "text-cyan";
    else if (line.startsWith("✓")) className = "text-[#28c840]";
    else if (line.includes("—")) className = "text-indigo";
    return (
      <span key={i} className={className}>
        {line}
        {"\n"}
      </span>
    );
  });
}
