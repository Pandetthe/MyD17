import { palette } from "@/styles/colors";
import type { ColorPalette, PaletteColor } from "@/styles/themes/theme";

export function tagColor(color: string | null | undefined): ColorPalette {
  if (color != null && color in palette) return color as PaletteColor;
  return "primary";
}
