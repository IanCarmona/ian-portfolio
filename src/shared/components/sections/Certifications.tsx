"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { BadgeCheck } from "lucide-react";

import { useLanguage } from "@/providers/LanguageProvider";
import { certifications } from "@/content/certifications";
import { Reveal, SectionTitle } from "@/shared/components/ui";

export function Certifications() {
  const t = useTranslations("certifications");
  const { locale } = useLanguage();

  return (
    <section id="certifications" className="relative scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {certifications.map((c, i) => (
            <Reveal key={c.title.en} delay={(i % 4) * 0.06}>
              <div className="flex h-full items-start gap-3 rounded-xl border border-border bg-surface/60 p-4 transition-colors hover:border-cyan/40">
                <BadgeCheck size={18} className="mt-0.5 flex-shrink-0 text-cyan" />
                <div>
                  <p className="text-sm font-medium leading-snug text-text">{c.title[locale]}</p>
                  <p className="mt-1 text-xs text-text-faint">
                    {c.issuer}
                    {c.year ? ` · ${c.year}` : ""}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
