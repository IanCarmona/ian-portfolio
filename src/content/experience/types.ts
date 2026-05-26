import type { LocalizedText } from "@/types/i18n";

export interface ExperienceItem {
  company: string;
  url?: string;
  role: LocalizedText;
  /** Display range, e.g. "Jul 2025". `present` flag renders the i18n "Present". */
  start: string;
  end: LocalizedText | null;
  location: LocalizedText;
  highlights: LocalizedText[];
  /** Accent used for the timeline node: "indigo" | "cyan". */
  accent: "indigo" | "cyan";
}
