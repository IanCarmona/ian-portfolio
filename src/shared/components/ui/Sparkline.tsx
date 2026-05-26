"use client";

import React, { useId, useMemo } from "react";
import { motion } from "framer-motion";

interface SparklineProps {
  /** Series values (any scale — normalized internally). */
  data: number[];
  accent?: "indigo" | "cyan";
  width?: number;
  height?: number;
  className?: string;
}

const ACCENTS = {
  indigo: { from: "#8b5cf6", to: "#a78bfa" },
  cyan: { from: "#22d3ee", to: "#67e8f9" },
};

/** Lightweight animated SVG sparkline (no chart lib). */
export function Sparkline({
  data,
  accent = "indigo",
  width = 220,
  height = 56,
  className,
}: SparklineProps) {
  const gradId = useId();
  const { line, area } = useMemo(() => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const stepX = width / (data.length - 1);
    const points = data.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / span) * (height - 8) - 4;
      return [x, y] as const;
    });
    const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
    const area = `${line} L${width},${height} L0,${height} Z`;
    return { line, area };
  }, [data, width, height]);

  const colors = ACCENTS[accent];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`line-${gradId}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={colors.from} />
          <stop offset="100%" stopColor={colors.to} />
        </linearGradient>
        <linearGradient id={`area-${gradId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.from} stopOpacity="0.25" />
          <stop offset="100%" stopColor={colors.from} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#area-${gradId})`} />
      <motion.path
        d={line}
        fill="none"
        stroke={`url(#line-${gradId})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
    </svg>
  );
}
