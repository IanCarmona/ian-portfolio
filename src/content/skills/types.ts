import type { LocalizedText } from "@/types/i18n";

export interface SkillCategory {
  title: LocalizedText;
  /** lucide-react icon name resolved in the Skills section. */
  icon: "Brain" | "Database" | "Code2" | "Cloud" | "Wrench";
  accent: "indigo" | "cyan";
  skills: string[];
}
