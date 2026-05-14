import { Color, colors } from "@/styles/colors";
import { fonts } from "@/styles/fonts";
import { borderRadius, size, spacing } from "@/styles/tokens";
import { Theme } from "./theme";

export function darkColorSet(color: Color) {
  return {
    main: color.main,
    text: {
      primary: color.extraLight,
      secondary: color.light,
    },
    background: {
      main: color.extraDark,
      accent: color.dark,
    },
  };
}

export const darkTheme: Theme = {
  colors: {
    surface: colors.core.extraDark,
    primary: {
      main: colors.core.main,
      text: {
        primary: colors.white,
        secondary: colors.core.light,
      },
      background: {
        main: `linear-gradient(180deg, ${colors.core.dark} 0%, ${colors.core.extraDark} 100%)`,
        accent: colors.core.dark,
      },
    },
    dark: {
      main: colors.core.light,
      text: {
        primary: colors.white,
        secondary: colors.core.light,
      },
      background: {
        main: colors.core.dark,
        accent: colors.core.extraDark,
      },
    },
    gradients: {
      settings: [colors.core.extraDark, colors.core.dark],
    },
    red: darkColorSet(colors.red),
    amber: darkColorSet(colors.amber),
    green: darkColorSet(colors.green),
    teal: darkColorSet(colors.teal),
    purple: darkColorSet(colors.purple),
    pink: darkColorSet(colors.pink),
    switch: {
      on: colors.core.main,
      off: colors.core.muted,
    },
  },
  spacing,
  size,
  borderRadius,
  fonts,
} as const;

export type DarkTheme = typeof darkTheme;
