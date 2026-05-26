"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/utils/cn";
import { useLanguage } from "@/providers/LanguageProvider";

interface LabShellProps {
  title: string;
  subtitle?: string;
  /** Short tech note shown as a pill, e.g. "100% en el navegador". */
  badge?: string;
  accent?: "indigo" | "cyan";
  children: React.ReactNode;
}

/** Shared chrome for every /lab tool: back link, title, frontend-only badge. */
export function LabShell({ title, subtitle, badge, accent = "indigo", children }: LabShellProps) {
  const { locale } = useLanguage();
  const back = locale === "es" ? "Volver al portafolio" : "Back to portfolio";

  return (
    <div className="min-h-screen">
      {/* top bar */}
      <header className="glass sticky top-0 z-40 border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a
            href="/#lab"
            className="inline-flex items-center gap-2 text-sm text-text-dim transition-colors hover:text-text"
          >
            <ArrowLeft size={16} />
            {back}
          </a>
          {badge && (
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                accent === "indigo"
                  ? "border-indigo/30 bg-indigo/10 text-indigo"
                  : "border-cyan/30 bg-cyan/10 text-cyan",
              )}
            >
              {badge}
            </span>
          )}
        </div>
      </header>

      {/* hero */}
      <div className="bg-radial-glow border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-3 max-w-2xl text-text-dim">{subtitle}</p>}
        </div>
      </div>

      {/* content */}
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
