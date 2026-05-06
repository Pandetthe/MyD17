import type { ColorPalette } from "@/styles/themes/theme";
import type { TailwindColorName } from "@repo/types";

export type CardColor = "red" | "green" | "teal";

const PALETTE_MAP: Record<TailwindColorName, ColorPalette> = {
  red: "red",
  rose: "red",
  orange: "amber",
  amber: "amber",
  yellow: "amber",
  lime: "green",
  green: "green",
  emerald: "green",
  teal: "teal",
  cyan: "teal",
  sky: "primary",
  blue: "primary",
  indigo: "purple",
  violet: "purple",
  purple: "purple",
  fuchsia: "pink",
  pink: "pink",
};

const CARD_COLOR_MAP: Record<TailwindColorName, CardColor> = {
  red: "red",
  rose: "red",
  orange: "red",
  amber: "red",
  yellow: "green",
  fuchsia: "red",
  pink: "red",
  lime: "green",
  green: "green",
  emerald: "green",
  teal: "teal",
  cyan: "teal",
  sky: "teal",
  blue: "teal",
  indigo: "teal",
  violet: "teal",
  purple: "teal",
};

export function strapiColorToPalette(color?: string): ColorPalette {
  return PALETTE_MAP[color as TailwindColorName] ?? "primary";
}

export function strapiColorToCard(color?: string): CardColor {
  return CARD_COLOR_MAP[color as TailwindColorName] ?? "teal";
}
