"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  BookOpen,
  Camera,
  CircleDot,
  Dumbbell,
  Mountain,
  Music,
  Trophy,
  Waves,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/utils/cn";
import { useLanguage } from "@/providers/LanguageProvider";
import { hobbies } from "@/content/hobbies";
import { Reveal, SectionTitle } from "@/shared/components/ui";

const ICONS: Record<string, LucideIcon> = {
  Waves,
  CircleDot,
  Music,
  BookOpen,
  Dumbbell,
  Trophy,
  Camera,
  Mountain,
};

export function Hobbies() {
  const t = useTranslations("hobbies");
  const { locale } = useLanguage();

  return (
    <section id="hobbies" className="relative scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
          align="center"
        />

        <div className="mx-auto mt-14 grid max-w-3xl gap-4 sm:grid-cols-3">
          {hobbies.map((h, i) => {
            const Icon = ICONS[h.icon] ?? Music;
            return (
              <Reveal key={h.label.en} delay={(i % 4) * 0.07}>
                <div className="group flex h-full flex-col items-center rounded-2xl border border-border bg-surface/60 p-6 text-center transition-colors hover:border-indigo/40">
                  <span
                    className={cn(
                      "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
                      h.accent === "indigo"
                        ? "bg-indigo/12 text-indigo"
                        : "bg-cyan/12 text-cyan",
                    )}
                  >
                    <Icon size={24} />
                  </span>
                  <p className="text-sm font-semibold text-text">{h.label[locale]}</p>
                  <p className="mt-1 text-xs leading-relaxed text-text-faint">
                    {h.description[locale]}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
