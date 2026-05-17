import * as LucideIcons from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

function kebabToPascal(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function getIcon(name?: string | null, fallback: LucideIcon = LucideIcons.HelpCircle): LucideIcon {
  if (!name) return fallback;
  const icon = (LucideIcons as Record<string, unknown>)[kebabToPascal(name)];
  if (icon != null && (typeof icon === "function" || typeof icon === "object")) return icon as LucideIcon;
  return fallback;
}
