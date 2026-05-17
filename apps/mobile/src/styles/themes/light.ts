import { Color, colors } from "@/styles/colors";
import { fonts } from "@/styles/fonts";
import { Theme } from "@/styles/themes/theme";
import { borderRadius, size, spacing } from "@/styles/tokens";

export function lightColorSet(color: Color) {
  return {
    main: color.main,
    icon: color.main,
    text: {
      primary: color.dark,
      secondary: color.main,
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
      icon: colors.core.main,
      text: {
        primary: colors.core.main,
        secondary: colors.core.dark,
      },
      background: {
        main: `linear-gradient(45deg, ${colors.core.extraLight} 0%, ${colors.core.surface} 100%)`,
        accent: colors.core.disabled,
      },
    },
    dark: {
      main: colors.core.dark,
      icon: colors.core.main,
      text: {
        primary: colors.core.dark,
        secondary: colors.core.muted,
      },
      background: {
        main: colors.core.dark,
        accent: colors.core.extraDark,
      },
    },
    gradients: {
      settings: [colors.core.surface, colors.core.disabled],
    },
    red: lightColorSet(colors.red),
    rose: lightColorSet(colors.rose),
    orange: lightColorSet(colors.orange),
    amber: lightColorSet(colors.amber),
    yellow: lightColorSet(colors.yellow),
    lime: lightColorSet(colors.lime),
    green: lightColorSet(colors.green),
    emerald: lightColorSet(colors.emerald),
    teal: lightColorSet(colors.teal),
    cyan: lightColorSet(colors.cyan),
    sky: lightColorSet(colors.sky),
    blue: lightColorSet(colors.blue),
    indigo: lightColorSet(colors.indigo),
    violet: lightColorSet(colors.violet),
    purple: lightColorSet(colors.purple),
    fuchsia: lightColorSet(colors.fuchsia),
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
