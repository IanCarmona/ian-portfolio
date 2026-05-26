"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

import { ButtonLink, Reveal, Tag } from "@/shared/components/ui";

const STACK = ["Next.js", "FastAPI", "GPT", "GCP", "Stripe"];

/** Standalone "flagship product" section for Amyra — kept apart from the
 * school-project grid so the production work doesn't get mixed with demos. */
export function FeaturedAmyra() {
  const t = useTranslations("featuredAmyra");

  return (
    <section id="amyra" className="relative scroll-mt-24 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="border-gradient relative overflow-hidden rounded-3xl bg-surface/70 px-6 py-10 sm:px-12 sm:py-14">
            <div className="bg-radial-glow pointer-events-none absolute inset-0 opacity-60" />
            <div className="relative grid items-center gap-8 sm:grid-cols-[180px_1fr]">
              {/* Logo */}
              <div className="flex justify-center sm:justify-start">
                <div className="relative">
                  <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-br from-indigo/30 to-cyan/30 blur-2xl" />
                  <Image
                    src="/projects/amyra.png"
                    alt="Amyra"
                    width={180}
                    height={180}
                    className="relative h-32 w-32 sm:h-40 sm:w-40"
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <div className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-indigo">
                  <span className="h-px w-8 bg-gradient-to-r from-indigo to-cyan" />
                  {t("eyebrow")}
                </div>
                <h2 className="font-serif text-4xl font-semibold tracking-tight text-text">
                  {t("title")}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-dim">
                  {t("lede")}
                </p>

                {/* KPIs */}
                <div className="mt-6 grid max-w-md grid-cols-3 gap-3">
                  <Kpi value="93%" label={t("kpi1")} />
                  <Kpi value="24/7" label={t("kpi2")} />
                  <Kpi value="✓" label={t("kpi3")} />
                </div>

                {/* Stack */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {STACK.map((s) => (
                    <Tag key={s} accent="indigo">
                      {s}
                    </Tag>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-7">
                  <ButtonLink href="https://amyra.com.mx" external size="lg">
                    {t("cta")}
                    <ArrowUpRight size={18} />
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Kpi({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/60 px-3 py-3">
      <div className="font-mono text-lg font-semibold text-text">{value}</div>
      <div className="mt-0.5 text-[11px] leading-tight text-text-faint">{label}</div>
    </div>
  );
}
