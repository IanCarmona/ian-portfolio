"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { GraduationCap, Languages as LanguagesIcon } from "lucide-react";

import { SITE } from "@/constants/site";
import { useLanguage } from "@/providers/LanguageProvider";
import { profile } from "@/content/profile";
import { CodeWindow, Reveal, SectionTitle } from "@/shared/components/ui";

export function About() {
  const t = useTranslations("about");
  const { locale } = useLanguage();

  return (
    <section id="about" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <div className="grid items-start gap-12 lg:grid-cols-2">
        {/* Left: narrative */}
        <div>
          <Reveal className="mb-7 flex items-center gap-4">
            <div className="rounded-full bg-gradient-to-br from-indigo to-cyan p-[2.5px] shadow-[0_0_30px_-8px_rgba(139,92,246,0.6)]">
              <Image
                src="/avatar.jpg"
                alt={SITE.name}
                width={160}
                height={160}
                priority
                className="h-20 w-20 rounded-full object-cover"
              />
            </div>
            <div>
              <p className="text-base font-semibold text-text">{SITE.shortName}</p>
              <p className="text-sm text-text-dim">AI &amp; Data Engineer</p>
              <p className="text-xs text-text-faint">{SITE.location}</p>
            </div>
          </Reveal>

          <SectionTitle eyebrow={t("eyebrow")} title={t("title")} />

          <div className="mt-6 space-y-4">
            {profile.bio.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className="text-base leading-relaxed text-text-dim">{p[locale]}</p>
              </Reveal>
            ))}
          </div>

          {/* Education */}
          <Reveal delay={0.1} className="mt-8">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
              <GraduationCap size={17} className="text-indigo" />
              {t("education")}
            </div>
            <div className="space-y-3">
              {profile.education.map((e) => (
                <div
                  key={e.school}
                  className="rounded-xl border border-border bg-surface/60 p-4"
                >
                  <p className="text-sm font-medium text-text">{e.degree[locale]}</p>
                  <p className="mt-0.5 text-xs text-text-dim">{e.school}</p>
                  <p className="mt-0.5 text-xs text-text-faint">{e.detail[locale]}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Languages */}
          <Reveal delay={0.15} className="mt-6">
            <div className="flex items-center gap-2 text-sm text-text-dim">
              <LanguagesIcon size={17} className="text-cyan" />
              <span className="font-semibold text-text">{t("languages")}:</span>
              {t("languageList")}
            </div>
          </Reveal>

          {/* Personal manifesto */}
          <Reveal delay={0.2} className="mt-8 border-l-2 border-indigo/40 pl-4">
            <p className="text-sm italic leading-relaxed text-text-dim">
              &ldquo;{t("manifesto")}&rdquo;
            </p>
          </Reveal>
        </div>

        {/* Right: animated terminal */}
        <Reveal delay={0.1} className="lg:sticky lg:top-28">
          <CodeWindow title={t("terminalTitle")} lines={profile.terminalLines} />
        </Reveal>
      </div>
    </section>
  );
}
