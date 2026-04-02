/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

const SemanticColors = {
  surfaceCanvas: "#F8FAFC",
  coreDark: "#212C3F",
  coreMuted: "#53535D",
  coreMain: "#1065AF",
  coreLight: "#85B9E5",
}

export const Colors = {
  light: {
    text: {
      primary: SemanticColors.coreDark,
      secondary: SemanticColors.coreMuted,
    },
    background: {
      primary: SemanticColors.surfaceCanvas,
      secondary: SemanticColors.coreLight,
    },
    accent: {
      primary: SemanticColors.coreMain,
      secondary: SemanticColors.coreLight,
    },
    red: {
      primary: "#EF4444",
      secondary: "#FCA5A5",
    }
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BorderRadius = {
  none: 0,
  small: 12,
  medium: 16,
  large: 32,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
