"use client";

import React from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/utils/cn";
import { useLanguage } from "@/providers/LanguageProvider";
import { projects } from "@/content/projects";
import { Card, Reveal, SectionTitle, Sparkline, StatNumber, Tag } from "@/shared/components/ui";

export function Projects() {
  const t = useTranslations("projects");
  const { locale } = useLanguage();

  return (
    <section id="projects" className="relative scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal key={p.title.en} delay={(i % 2) * 0.08}>
              <Card gradientBorder interactive className="flex h-full flex-col">
                {/* metric + sparkline */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div
                      className={cn(
                        "text-4xl font-semibold tracking-tight",
                        p.accent === "indigo" ? "text-indigo" : "text-cyan",
                      )}
                    >
                      <StatNumber value={p.metric.value} prefix={p.metric.prefix} suffix={p.metric.suffix} />
                    </div>
                    <p className="mt-1 max-w-[16rem] text-xs text-text-faint">
                      {t("impact")}: {p.metric.label[locale]}
                    </p>
                  </div>
                  <Sparkline data={p.sparkline} accent={p.accent} width={120} height={48} />
                </div>

                {/* title + summary */}
                <div className="mt-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-text">{p.title[locale]}</h3>
                    <span className="text-xs text-text-faint">· {p.company}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-text-dim">{p.summary[locale]}</p>
                </div>

                {/* stack */}
                <div className="mt-5 flex flex-wrap gap-2 pt-1">
                  {p.stack.map((s) => (
                    <Tag key={s} accent={p.accent}>
                      {s}
                    </Tag>
                  ))}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
