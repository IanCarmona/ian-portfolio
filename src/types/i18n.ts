import type { Locale } from "@/providers/LanguageProvider";

/** A piece of content available in both supported languages. */
export type LocalizedText = Record<Locale, string>;

/** Pick the right language out of a LocalizedText. */
export function t(text: LocalizedText, locale: Locale): string {
  return text[locale];
}
