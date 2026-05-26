"use client";

import React from "react";
import { HelpCircle, MousePointerClick, Sparkles } from "lucide-react";

interface ExplainerProps {
  /** Plain-language: what this tool is. */
  what: string;
  /** Plain-language: which skill it demonstrates (for recruiters). */
  shows: string;
  /** Plain-language: how to use it. */
  how: string;
  /** Localized section titles. */
  labels: { what: string; shows: string; how: string };
}

/** Friendly, non-technical explainer shown at the top of every lab tool. */
export function LabExplainer({ what, shows, how, labels }: ExplainerProps) {
  const items = [
    { icon: HelpCircle, title: labels.what, text: what, color: "text-cyan" },
    { icon: Sparkles, title: labels.shows, text: shows, color: "text-indigo" },
    { icon: MousePointerClick, title: labels.how, text: how, color: "text-cyan" },
  ];
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-3">
      {items.map((it) => (
        <div key={it.title} className="rounded-2xl border border-border bg-surface/40 p-5">
          <div className="mb-2 flex items-center gap-2">
            <it.icon size={16} className={it.color} />
            <h3 className="text-sm font-semibold text-text">{it.title}</h3>
          </div>
          <p className="text-sm leading-relaxed text-text-dim">{it.text}</p>
        </div>
      ))}
    </div>
  );
}

/** Shared localized labels for the explainer titles. */
export function explainerLabels(locale: "es" | "en") {
  return locale === "es"
    ? { what: "¿Qué es esto?", shows: "¿Qué demuestra?", how: "Cómo usarlo" }
    : { what: "What is this?", shows: "What it shows", how: "How to use it" };
}
