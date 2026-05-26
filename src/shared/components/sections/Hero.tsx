"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Github, Linkedin, Sparkles } from "lucide-react";

import { SITE } from "@/constants/site";
import { useLanguage } from "@/providers/LanguageProvider";
import { profile } from "@/content/profile";
import { ButtonLink, GradientText, StatNumber } from "@/shared/components/ui";
import { NeuralBackground } from "./NeuralBackground";

export function Hero() {
  const t = useTranslations("hero");
  const tStats = useTranslations("stats");
  const { locale } = useLanguage();
  const [roleIndex, setRoleIndex] = useState(0);

  const roles = profile.roles;
  // Reserve the width of the longest role so the headline never reflows on change.
  const longestRole = useMemo(
    () =>
      roles.reduce((a, r) => (r.label[locale].length > a.length ? r.label[locale] : a), ""),
    [roles, locale],
  );

  useEffect(() => {
    const id = setInterval(() => {
      setRoleIndex((i) => (i + 1) % roles.length);
    }, 2600);
    return () => clearInterval(id);
  }, [roles.length]);

  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-16"
    >
      <NeuralBackground className="opacity-70" />
      <div className="bg-radial-glow pointer-events-none absolute inset-0" />
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      {/* fade canvas into the page bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        {/* Availability badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo/30 bg-indigo/10 px-4 py-1.5 text-xs font-medium text-indigo"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
          </span>
          {t("badge")}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-4 inline-flex items-center gap-2 text-sm text-text-dim"
        >
          <Sparkles size={15} className="text-cyan" />
          {t("intro")}
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-balance font-serif text-4xl font-semibold leading-[1.18] tracking-tight sm:text-6xl"
        >
          {t("buildPrefix")}{" "}
          <span className="relative inline-block align-baseline">
            {/* invisible sizer: holds the box at the longest role's width
                and establishes the same baseline as the surrounding text */}
            <span aria-hidden className="invisible whitespace-nowrap">
              {longestRole}
            </span>
            <AnimatePresence initial={false}>
              <motion.span
                key={roleIndex}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-x-0 top-0 whitespace-nowrap text-center"
              >
                <GradientText>{roles[roleIndex].label[locale]}</GradientText>
              </motion.span>
            </AnimatePresence>
          </span>
          <br className="hidden sm:block" />
          <span className="text-text"> {t("buildSuffix")}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-text-dim sm:text-lg"
        >
          {t("subtitle")}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <ButtonLink href="#contact" size="lg">
            {t("ctaPrimary")}
            <ArrowUpRight size={18} />
          </ButtonLink>
          <ButtonLink href="#projects" variant="secondary" size="lg">
            {t("ctaSecondary")}
          </ButtonLink>
          <div className="ml-1 flex items-center gap-1">
            <a
              href={SITE.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-text-dim transition-colors hover:border-indigo/60 hover:text-text"
            >
              <Github size={18} />
            </a>
            <a
              href={SITE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-text-dim transition-colors hover:border-indigo/60 hover:text-text"
            >
              <Linkedin size={18} />
            </a>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-14 grid w-full max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4"
        >
          {profile.stats.map((s) => (
            <div key={s.labelKey} className="bg-surface/80 px-4 py-5 text-center">
              <div className="text-2xl font-semibold text-text sm:text-3xl">
                <StatNumber value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <div className="mt-1 text-[11px] leading-tight text-text-dim">
                {tStats(s.labelKey)}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <a
        href="#about"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-text-faint transition-colors hover:text-text"
        aria-label={t("scroll")}
      >
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="flex flex-col items-center gap-1 text-[10px] uppercase tracking-widest"
        >
          {t("scroll")}
          <ArrowDown size={14} />
        </motion.span>
      </a>
    </section>
  );
}
