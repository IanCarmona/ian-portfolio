/** Single source of truth for personal links & contact info. */
export const SITE = {
  name: "Ian Carlo Carmona Serrano",
  shortName: "Ian Carmona",
  initials: "IC",
  location: "Ciudad de México, México",
  email: "iancarlocs@gmail.com",
  phone: "+52 55 7852 0955",
  phoneHref: "+525578520955",
  linkedin: "https://www.linkedin.com/in/engineer-ia-ian-carmona/",
  github: "https://github.com/IanCarmona",
  /** CV is served per locale — the download follows the active language toggle. */
  cv: {
    es: "/cv/CV_Ian_Carmona_ES.pdf",
    en: "/cv/CV_Ian_Carmona_EN.pdf",
  },
  url: "https://iancarmona.dev",
} as const;

/** Anchor sections used by the navbar. Order mirrors the page section order. */
export const NAV_SECTIONS = [
  "lab",
  "about",
  "experience",
  "projects",
  "skills",
  "contact",
] as const;

export type NavSection = (typeof NAV_SECTIONS)[number];
