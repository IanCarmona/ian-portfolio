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
  cvPath: "/cv/CV_Ian_Carmona.pdf",
  url: "https://iancarmona.dev",
} as const;

/** Anchor sections used by the navbar. */
export const NAV_SECTIONS = [
  "about",
  "experience",
  "projects",
  "lab",
  "skills",
  "contact",
] as const;

export type NavSection = (typeof NAV_SECTIONS)[number];
