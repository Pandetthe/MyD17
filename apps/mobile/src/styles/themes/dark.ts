import { colors } from "@/styles/colors";
import { fonts } from "@/styles/fonts";
import { Theme } from "@/styles/themes/theme";
import { borderRadius, size, spacing } from "@/styles/tokens";

export const darkTheme: Theme = {
  mode: "dark",
  colors: {
    surface: colors.core.extraDark,
    primary: {
      main:     colors.core.main,
      text:     colors.white,
      subtext:  colors.core.extraLight,
      bgAccent: colors.core.dark,
    },
    dark: {
      main:     colors.core.light,
      text:     colors.white,
      subtext:  colors.core.extraLight,
      bg:       colors.core.dark,
      bgAccent: colors.core.extraDark,
    },
    gradients: {
      settings: [colors.core.extraDark, colors.core.extraDark],
      posts:    [colors.core.extraDark, colors.core.extraDark],
    },
    switch: { on: colors.core.main, off: colors.core.muted },
  },
  spacing,
  size,
  borderRadius,
  fonts,
} as const;

export type DarkTheme = typeof darkTheme;
