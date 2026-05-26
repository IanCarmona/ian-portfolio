import { clsx, type ClassValue } from "clsx";

/** Merge conditional class names (mirrors Amyra's cn helper). */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
