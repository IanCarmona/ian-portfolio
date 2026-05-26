import type { LocalizedText } from "@/types/i18n";

export interface Hobby {
  label: LocalizedText;
  description: LocalizedText;
  /** lucide-react icon name resolved in the Hobbies section. */
  icon: "Waves" | "CircleDot" | "Music" | "BookOpen" | "Dumbbell" | "Trophy" | "Camera" | "Mountain";
  accent: "indigo" | "cyan";
}
