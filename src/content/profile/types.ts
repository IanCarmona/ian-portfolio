import type { LocalizedText } from "@/types/i18n";

export interface Role {
  /** Rotating headline word, e.g. "AI Engineer". */
  label: LocalizedText;
}

export interface HeadlineStat {
  /** Numeric target the counter animates to. */
  value: number;
  /** Prefix/suffix glyphs around the number. */
  prefix?: string;
  suffix?: string;
  /** i18n key under the "stats" namespace. */
  labelKey: string;
}

export interface EducationItem {
  degree: LocalizedText;
  school: string;
  detail: LocalizedText;
}

export interface Profile {
  roles: Role[];
  bio: LocalizedText[];
  stats: HeadlineStat[];
  education: EducationItem[];
  /** Lines rendered in the animated terminal window. */
  terminalLines: string[];
}
