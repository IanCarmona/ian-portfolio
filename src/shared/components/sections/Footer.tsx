"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowUp, Download, Github, Linkedin, Mail, MapPin } from "lucide-react";

import { SITE, NAV_SECTIONS } from "@/constants/site";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-surface/30">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <a href="#top" className="flex items-center gap-2.5">
              <span className="block rounded-full bg-gradient-to-br from-indigo to-cyan p-[1.5px]">
                <Image
                  src="/avatar.jpg"
                  alt={SITE.name}
                  width={72}
                  height={72}
                  className="block h-9 w-9 rounded-full object-cover"
                />
              </span>
              <span className="font-serif text-lg font-semibold tracking-tight">
                {SITE.shortName}
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-dim">
              {t("tagline")}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[
                { icon: Mail, href: `mailto:${SITE.email}`, label: "Email", external: false },
                { icon: Linkedin, href: SITE.linkedin, label: "LinkedIn", external: true },
                { icon: Github, href: SITE.github, label: "GitHub", external: true },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  {...(s.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-dim transition-colors hover:border-indigo/60 hover:text-text"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-faint">
              {t("navTitle")}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {NAV_SECTIONS.map((s) => (
                <li key={s}>
                  <a
                    href={`#${s}`}
                    className="text-sm text-text-dim transition-colors hover:text-text"
                  >
                    {tNav(s)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-faint">
              {t("contactTitle")}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-text-dim">
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-text"
                >
                  <Mail size={14} className="text-cyan" />
                  {SITE.email}
                </a>
              </li>
              <li className="inline-flex items-center gap-2">
                <MapPin size={14} className="text-cyan" />
                {SITE.location}
              </li>
              <li>
                <a
                  href={SITE.cvPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-text"
                >
                  <Download size={14} className="text-cyan" />
                  {tNav("downloadCv")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-text-faint">
            © {year} {SITE.shortName}. {t("rights")} · {t("builtWith")}
          </p>
          <a
            href="#top"
            className="inline-flex items-center gap-1.5 text-xs text-text-dim transition-colors hover:text-text"
          >
            {t("backToTop")}
            <ArrowUp size={13} />
          </a>
        </div>
      </div>
    </footer>
  );
}
