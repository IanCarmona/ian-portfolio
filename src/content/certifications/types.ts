import type { LocalizedText } from "@/types/i18n";

export interface Certification {
  title: LocalizedText;
  issuer: string;
  year?: string;
}
