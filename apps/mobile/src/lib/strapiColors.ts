import type { ColorPalette } from "@/styles/themes/theme";
import type { TailwindColorName } from "@repo/types";

export type CardColor = TailwindColorName;

const VALID_COLORS: TailwindColorName[] = [
  "red", "rose", "orange", "amber", "yellow", "lime", "green", "emerald",
  "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink",
];

export function strapiColorToPalette(color?: string): ColorPalette {
  if (VALID_COLORS.includes(color as TailwindColorName)) return color as ColorPalette;
  return "primary";
}

export function strapiColorToCard(color?: string): CardColor {
  if (VALID_COLORS.includes(color as TailwindColorName)) return color as CardColor;
  return "teal";
}
