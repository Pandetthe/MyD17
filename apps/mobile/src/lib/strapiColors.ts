import type { ColorPalette } from "@/styles/themes/theme";

export function strapiColorToPalette(color?: string): ColorPalette {
  const paletteKeys: ColorPalette[] = ["red", "amber", "green", "teal", "purple", "pink"];
  if (paletteKeys.includes(color as ColorPalette)) return color as ColorPalette;
  return "teal";
}

export const strapiColorToCard = strapiColorToPalette;
