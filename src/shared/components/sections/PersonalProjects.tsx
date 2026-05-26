"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Github } from "lucide-react";

import { cn } from "@/utils/cn";
import { useLanguage } from "@/providers/LanguageProvider";
import { personalProjects } from "@/content/personalProjects";
import { Card, Reveal, SectionTitle, Tag } from "@/shared/components/ui";

export function PersonalProjects() {
  const t = useTranslations("personalProjects");
  const { locale } = useLanguage();

  return (
    <section id="lab" className="relative scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {personalProjects.map((p, i) => (
            <Reveal key={p.title} delay={(i % 3) * 0.07}>
              <Card interactive className="flex h-full flex-col">
                {/* thumbnail */}
                <div
                  className={cn(
                    "mb-5 flex h-28 items-center justify-center rounded-xl border",
                    p.accent === "indigo"
                      ? "border-indigo/20 bg-indigo/8"
                      : "border-cyan/20 bg-cyan/8",
                  )}
                >
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.title}
                      width={72}
                      height={72}
                      className="h-16 w-16 object-contain"
                    />
                  ) : (
                    <span className="text-4xl" aria-hidden>
                      {p.emoji ?? "✦"}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-text">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-text-dim">
                  {p.description[locale]}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <Tag key={s} accent={p.accent}>
                      {s}
                    </Tag>
                  ))}
                </div>

                {/* actions */}
                <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
                  {p.demoUrl && (
                    <a
                      href={p.demoUrl}
                      {...(p.demoUrl.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo to-cyan px-3 py-2 text-sm font-medium text-white transition-[filter] hover:brightness-110"
                    >
                      {t("demo")}
                      <ArrowUpRight size={15} />
                    </a>
                  )}
                  {p.repoUrl && (
                    <a
                      href={p.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("code")}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-text-dim transition-colors hover:border-indigo/60 hover:text-text"
                    >
                      <Github size={16} />
                      {!p.demoUrl && t("code")}
                    </a>
                  )}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
