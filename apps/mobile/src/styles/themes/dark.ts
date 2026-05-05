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

// TODO (sc-100): Choose appropriate colors
export const darkTheme: Theme = {
  colors: {
    surface: colors.surface,
    primary: {
      main: colors.core.main,
      text: {
        primary: colors.core.dark,
        secondary: colors.core.muted,
      },
      background: {
        main: `linear-gradient(45deg, ${colors.core.extraLight} 0%, ${colors.core.surface} 100%)`,
        accent: colors.core.light,
      },
    },
    dark: {
      main: colors.core.dark,
      text: {
        primary: colors.core.dark,
        secondary: colors.core.extraDark,
      },
      background: {
        main: colors.white,
        accent: colors.core.surface,
      },
    },
    gradients: {
      settings: [colors.core.surface, colors.core.light],
    },
    red: darkColorSet(colors.red),
    amber: darkColorSet(colors.amber),
    green: darkColorSet(colors.green),
    teal: darkColorSet(colors.teal),
    purple: darkColorSet(colors.purple),
    pink: darkColorSet(colors.pink),
    switch: {
      on: colors.core.main,
      off: colors.core.disabled,
    },
  },
  spacing,
  size,
  borderRadius,
  fonts,
} as const;

export type DarkTheme = typeof darkTheme;
