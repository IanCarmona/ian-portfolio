import type { LocalizedText } from "@/types/i18n";

export interface PersonalProject {
  title: string;
  description: LocalizedText;
  stack: string[];
  /** Live, clickable demo so people can try it. */
  demoUrl?: string;
  /** Source code. */
  repoUrl?: string;
  /** Emoji or short glyph shown in the card thumbnail (fallback). */
  emoji?: string;
  /** Logo/image path (in /public) shown in the thumbnail instead of the emoji. */
  image?: string;
  accent: "indigo" | "cyan";
}
