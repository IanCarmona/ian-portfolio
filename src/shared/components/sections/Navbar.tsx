"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Download, Languages, Menu, X } from "lucide-react";

import { cn } from "@/utils/cn";
import { SITE, NAV_SECTIONS } from "@/constants/site";
import { useLanguage } from "@/providers/LanguageProvider";
import { ButtonLink } from "@/shared/components/ui";

export function Navbar() {
  const t = useTranslations("nav");
  const { locale, toggle } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-x-0 top-3 z-50 flex justify-center px-4"
    >
      <nav
        className={cn(
          "flex w-full max-w-5xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-300 sm:px-5",
          scrolled
            ? "glass border border-border shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
            : "border border-transparent",
        )}
      >
        {/* Logo — circular avatar with gradient ring */}
        <a href="#top" className="flex items-center gap-2.5">
          <span className="block rounded-full bg-gradient-to-br from-indigo to-cyan p-[1.5px]">
            <Image
              src="/avatar.jpg"
              alt={SITE.name}
              width={72}
              height={72}
              priority
              className="block h-9 w-9 rounded-full object-cover"
            />
          </span>
          <span className="hidden text-sm font-semibold tracking-tight sm:block">
            {SITE.shortName}
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_SECTIONS.map((s) => (
            <a
              key={s}
              href={`#${s}`}
              className="rounded-lg px-3 py-1.5 text-sm text-text-dim transition-colors hover:bg-surface-2/60 hover:text-text"
            >
              {t(s)}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle language"
            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text-dim transition-colors hover:border-indigo/60 hover:text-text"
          >
            <Languages size={14} />
            {locale.toUpperCase()}
          </button>
          <ButtonLink
            href={SITE.cvPath}
            external
            size="md"
            className="hidden !px-4 !py-2 text-xs sm:inline-flex"
          >
            <Download size={14} />
            {t("downloadCv")}
          </ButtonLink>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-dim md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass absolute top-16 left-4 right-4 rounded-2xl border border-border p-3 md:hidden"
        >
          {NAV_SECTIONS.map((s) => (
            <a
              key={s}
              href={`#${s}`}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-4 py-2.5 text-sm text-text-dim hover:bg-surface-2/60 hover:text-text"
            >
              {t(s)}
            </a>
          ))}
          <a
            href={SITE.cvPath}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo to-cyan px-4 py-2.5 text-sm font-medium text-white"
          >
            <Download size={15} />
            {t("downloadCv")}
          </a>
        </motion.div>
      )}
    </motion.header>
  );
}
