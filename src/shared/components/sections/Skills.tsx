"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Brain, Cloud, Code2, Database, Wrench, type LucideIcon } from "lucide-react";

import { cn } from "@/utils/cn";
import { useLanguage } from "@/providers/LanguageProvider";
import { marqueeSkills, skillCategories } from "@/content/skills";
import { Card, Reveal, SectionTitle, Tag } from "@/shared/components/ui";

const ICONS: Record<string, LucideIcon> = {
  Brain,
  Database,
  Code2,
  Cloud,
  Wrench,
};

export function Skills() {
  const t = useTranslations("skills");
  const { locale } = useLanguage();

  return (
    <section id="skills" className="relative scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {skillCategories.map((cat, i) => {
            const Icon = ICONS[cat.icon];
            return (
              <Reveal key={cat.title.en} delay={(i % 3) * 0.07}>
                <Card interactive className="h-full">
                  <div className="mb-4 flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        cat.accent === "indigo"
                          ? "bg-indigo/12 text-indigo"
                          : "bg-cyan/12 text-cyan",
                      )}
                    >
                      <Icon size={19} />
                    </span>
                    <h3 className="text-base font-semibold text-text">{cat.title[locale]}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((s) => (
                      <Tag key={s}>{s}</Tag>
                    ))}
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Marquee tech strip */}
      <div className="relative mt-16 overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-marquee gap-3">
          {[...marqueeSkills, ...marqueeSkills].map((s, i) => (
            <span
              key={i}
              className="rounded-full border border-border bg-surface/60 px-4 py-2 font-mono text-sm text-text-dim"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
