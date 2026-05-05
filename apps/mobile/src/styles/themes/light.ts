import { Color, colors } from "@/styles/colors";
import { fonts } from "@/styles/fonts";
import { Theme } from "@/styles/themes/theme";
import { borderRadius, size, spacing } from "@/styles/tokens";

export function lightColorSet(color: Color) {
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
      settings: [colors.core.surface, colors.core.light],
    },
    red: lightColorSet(colors.red),
    amber: lightColorSet(colors.amber),
    green: lightColorSet(colors.green),
    teal: lightColorSet(colors.teal),
    purple: lightColorSet(colors.purple),
    pink: lightColorSet(colors.pink),
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
