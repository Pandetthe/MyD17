import { Color, colors } from "@/styles/colors";
import { fonts } from "@/styles/fonts";
import { borderRadius, size, spacing } from "@/styles/tokens";
import { Theme } from "./theme";

export function colorSet(color: Color) {
  return {
    main: color.main,
    text: {
      primary: color.extraDark,
      secondary: color.dark,
    },
    background: {
      main: color.extraLight,
      accent: color.light,
    },
  };
}

export const lightTheme: Theme = {
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
      settings: [colors.core.surface, colors.core.light]
    },
    red: colorSet(colors.red),
    amber: colorSet(colors.amber),
    green: colorSet(colors.green),
    teal: colorSet(colors.teal),
    purple: colorSet(colors.purple),
    pink: colorSet(colors.pink),
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

export type LightTheme = typeof lightTheme;
