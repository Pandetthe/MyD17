import { colorGroups, colors } from "@/styles/colors";
import { fonts } from "@/styles/fonts";
import { Theme } from "@/styles/themes/theme";
import { borderRadius, size, spacing } from "@/styles/tokens";

export const darkTheme: Theme = {
  mode: "dark",
  colors: {
    surface: colors.core.extraDark,

    primary: {
      main: colors.core.main,
      text:       { primary: colors.white,      secondary: colors.core.extraLight },
      background: {
        main:   `linear-gradient(180deg, ${colors.core.dark} 0%, ${colors.core.extraDark} 100%)`,
        accent: colors.core.dark,
      },
    },

    // Used for drawer background + any "dark-toned" card
    dark: {
      main: colors.core.light,
      text:       { primary: colors.white,      secondary: colors.core.extraLight },
      background: { main: colors.core.dark,     accent: colors.core.extraDark },
    },

    gradients: {
      settings: [colors.core.extraDark, colors.core.extraDark],
      posts:    [colors.core.extraDark, colors.core.extraDark],
    },

    red:    colorGroups.red.dark,
    amber:  colorGroups.amber.dark,
    green:  colorGroups.green.dark,
    teal:   colorGroups.teal.dark,
    purple: colorGroups.purple.dark,
    pink:   colorGroups.pink.dark,

    switch: { on: colors.core.main, off: colors.core.muted },
  },
  spacing,
  size,
  borderRadius,
  fonts,
} as const;

export type DarkTheme = typeof darkTheme;
