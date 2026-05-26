"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Download, Github, Linkedin, Mail, MapPin, Phone } from "lucide-react";

import { SITE } from "@/constants/site";
import { ButtonLink, GradientText, Reveal } from "@/shared/components/ui";

export function Contact() {
  const t = useTranslations("contact");

  const links = [
    { icon: Mail, label: SITE.email, href: `mailto:${SITE.email}` },
    { icon: Phone, label: SITE.phone, href: `tel:${SITE.phoneHref}` },
    { icon: Linkedin, label: "LinkedIn", href: SITE.linkedin, external: true },
    { icon: Github, label: "GitHub", href: SITE.github, external: true },
  ];

  return (
    <section id="contact" className="relative scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="border-gradient relative overflow-hidden rounded-3xl bg-surface/70 px-6 py-14 text-center sm:px-12">
            <div className="bg-radial-glow pointer-events-none absolute inset-0 opacity-70" />
            <div className="relative">
              <div className="mb-3 flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-indigo">
                <span className="h-px w-8 bg-gradient-to-r from-indigo to-cyan" />
                {t("eyebrow")}
                <span className="h-px w-8 bg-gradient-to-l from-indigo to-cyan" />
              </div>

              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                <GradientText>{t("title")}</GradientText>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-text-dim">
                {t("subtitle")}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <ButtonLink href={`mailto:${SITE.email}`} size="lg">
                  <Mail size={18} />
                  {t("emailCta")}
                </ButtonLink>
                <ButtonLink href={SITE.cvPath} external variant="secondary" size="lg">
                  <Download size={18} />
                  {t("downloadCv")}
                </ButtonLink>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-text-dim">
                {links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    {...(l.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="inline-flex items-center gap-2 transition-colors hover:text-text"
                  >
                    <l.icon size={15} className="text-cyan" />
                    {l.label}
                  </a>
                ))}
                <span className="inline-flex items-center gap-2 text-text-faint">
                  <MapPin size={15} />
                  {SITE.location}
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
