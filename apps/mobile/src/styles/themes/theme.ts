export interface ColorGroup {
  main: string;
  text: {
    primary: string;
    secondary: string;
  };
  background: {
    main: string;
    accent: string;
  };
}

export interface SwitchColors {
  on: string;
  off: string;
}

export interface GradientGroup {
  settings: string[];
}

export interface ThemeColors {
  surface: string;
  primary: ColorGroup;
  dark: ColorGroup;
  gradients: GradientGroup;
  red: ColorGroup;
  amber: ColorGroup;
  green: ColorGroup;
  teal: ColorGroup;
  purple: ColorGroup;
  pink: ColorGroup;
  switch: SwitchColors;
}

export interface Theme {
  colors: ThemeColors;
  spacing: Record<string, number>;
  size: Record<string, number>;
  borderRadius: Record<string, number>;
  fonts: {
    sans: string;
    serif: string;
    rounded: string;
    mono: string;
  };
}

export type ColorPalette = Exclude<keyof ThemeColors, "surface">;
