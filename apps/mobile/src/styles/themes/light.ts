import { semanticColors } from "@/styles/semantic-colors";
import { borderRadius, spacing } from "@/styles/tokens";
import { fonts } from "@/styles/fonts";

export const lightTheme = {
  colors: {
    canvas: semanticColors.surfaceCanvas,
    text: {
      primary: semanticColors.coreDark,
      secondary: semanticColors.coreMuted,
    },
    background: {
      primary: semanticColors.surfaceCanvas,
      secondary: semanticColors.coreLight,
    },
    accent: {
      primary: semanticColors.coreMain,
      secondary: semanticColors.coreLight,
    },
    danger: {
      primary: "#EF4444",
      secondary: "#FCA5A5",
    },
  },
  spacing,
  borderRadius,
  fonts,
} as const;

export type LightTheme = typeof lightTheme;
