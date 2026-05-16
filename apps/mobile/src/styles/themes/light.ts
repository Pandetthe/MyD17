import { colorGroups, colors } from "@/styles/colors";
import { fonts } from "@/styles/fonts";
import { Theme } from "@/styles/themes/theme";
import { borderRadius, size, spacing } from "@/styles/tokens";

export const lightTheme: Theme = {
  mode: "light",
  colors: {
    surface: colors.core.surface,

    primary: {
      main: colors.core.main,
      text:       { primary: colors.core.dark,  secondary: colors.core.muted },
      background: {
        main:   `linear-gradient(45deg, ${colors.core.extraLight} 0%, ${colors.core.surface} 100%)`,
        accent: colors.core.disabled,
      },
    },

    // Used for drawer background + any "dark-toned" card
    dark: {
      main: colors.core.dark,
      text:       { primary: colors.white,           secondary: colors.core.extraLight },
      background: { main: colors.core.dark,          accent: colors.white },
    },

    gradients: {
      settings: [colors.core.surface, colors.core.disabled],
      posts:    ["#F0F9FF", "#E0F2FE"],
    },

    red:    colorGroups.red.light,
    amber:  colorGroups.amber.light,
    green:  colorGroups.green.light,
    teal:   colorGroups.teal.light,
    purple: colorGroups.purple.light,
    pink:   colorGroups.pink.light,

    switch: { on: colors.core.main, off: colors.core.disabled },
  },
  spacing,
  size,
  borderRadius,
  fonts,
} as const;

export type LightTheme = typeof lightTheme;
