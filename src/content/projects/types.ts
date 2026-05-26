import type { LocalizedText } from "@/types/i18n";

export interface Project {
  title: LocalizedText;
  company: string;
  summary: LocalizedText;
  stack: string[];
  /** Hero metric for the card. */
  metric: {
    value: number;
    prefix?: string;
    suffix?: string;
    label: LocalizedText;
  };
  /** Normalized 0-100 points for the decorative sparkline. */
  sparkline: number[];
  accent: "indigo" | "cyan";
}
