import type { ColorPalette } from "@/styles/themes/theme";
import type { TailwindColorName } from "@repo/types";

export function strapiColorToPalette(color?: string): ColorPalette {
  const paletteKeys: TailwindColorName[] = [
    "red",
    "rose",
    "orange",
    "amber",
    "yellow",
    "lime",
    "green",
    "emerald",
    "teal",
    "cyan",
    "sky",
    "blue",
    "indigo",
    "violet",
    "purple",
    "fuchsia",
    "pink",
  ];

  if (paletteKeys.includes(color as TailwindColorName)) return color as ColorPalette;
  return "teal";
}

export const strapiColorToCard = strapiColorToPalette;
