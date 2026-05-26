"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, MapPin } from "lucide-react";

import { cn } from "@/utils/cn";
import { useLanguage } from "@/providers/LanguageProvider";
import { experience } from "@/content/experience";
import { Reveal, SectionTitle } from "@/shared/components/ui";

export function Experience() {
  const t = useTranslations("experience");
  const { locale } = useLanguage();

  return (
    <section id="experience" className="relative scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionTitle eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <div className="relative mt-14 pl-8 sm:pl-10">
          {/* vertical rail */}
          <div className="absolute left-[10px] top-2 bottom-2 w-px bg-gradient-to-b from-indigo via-cyan to-transparent sm:left-[14px]" />

          <div className="space-y-10">
            {experience.map((item, i) => (
              <Reveal key={item.company + item.start} delay={i * 0.05} as="div">
                <div className="relative">
                  {/* node */}
                  <span
                    className={cn(
                      "absolute -left-8 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-bg sm:-left-10",
                      item.accent === "indigo" ? "bg-indigo" : "bg-cyan",
                    )}
                  />

                  <div className="rounded-2xl border border-border bg-surface/60 p-5 transition-colors hover:border-indigo/40 sm:p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="text-lg font-semibold text-text">{item.role[locale]}</h3>
                      <span className="font-mono text-xs text-text-faint">
                        {item.start} — {item.end ? item.end[locale] : t("present")}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "inline-flex items-center gap-1 font-medium transition-colors hover:underline",
                            item.accent === "indigo" ? "text-indigo" : "text-cyan",
                          )}
                        >
                          {item.company}
                          <ArrowUpRight size={13} />
                        </a>
                      ) : (
                        <span
                          className={cn(
                            "font-medium",
                            item.accent === "indigo" ? "text-indigo" : "text-cyan",
                          )}
                        >
                          {item.company}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-text-faint">
                        <MapPin size={12} />
                        {item.location[locale]}
                      </span>
                    </div>

                    <ul className="mt-4 space-y-2">
                      {item.highlights.map((h, hi) => (
                        <li key={hi} className="flex gap-2.5 text-sm leading-relaxed text-text-dim">
                          <span
                            className={cn(
                              "mt-2 h-1 w-1 flex-shrink-0 rounded-full",
                              item.accent === "indigo" ? "bg-indigo" : "bg-cyan",
                            )}
                          />
                          {h[locale]}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
