import { colors } from "@/styles/colors";
import { fonts } from "@/styles/fonts";
import { Theme } from "@/styles/themes/theme";
import { borderRadius, size, spacing } from "@/styles/tokens";

export const lightTheme: Theme = {
  mode: "light",
  colors: {
    surface: colors.core.surface,
    primary: {
      main:     colors.core.main,
      text:     colors.core.dark,
      subtext:  colors.core.muted,
      bgAccent: colors.core.disabled,
    },
    dark: {
      main:     colors.core.dark,
      text:     colors.white,
      subtext:  colors.core.extraLight,
      bg:       colors.core.dark,
      bgAccent: colors.white,
    },
    gradients: {
      settings: [colors.core.surface, colors.core.disabled],
      posts:    ["#EDF6FE", "#D4E7F8"],
    },
    switch: { on: colors.core.main, off: colors.core.disabled },
  },
  spacing,
  size,
  borderRadius,
  fonts,
} as const;

export type LightTheme = typeof lightTheme;
