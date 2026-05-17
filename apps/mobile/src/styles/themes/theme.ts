export type ColorGroup = {
  main: string;
  icon: string;
  text: {
    primary: string;
    secondary: string;
  };
  background: {
    main: string;
    accent: string;
  };
};

export type SwitchColors = {
  on: string;
  off: string;
};

export type GradientGroup = {
  settings: string[];
};

export type ThemeColors = {
  surface: string;
  primary: ColorGroup;
  dark: ColorGroup;
  gradients: GradientGroup;
  red: ColorGroup;
  rose: ColorGroup;
  orange: ColorGroup;
  amber: ColorGroup;
  yellow: ColorGroup;
  lime: ColorGroup;
  green: ColorGroup;
  emerald: ColorGroup;
  teal: ColorGroup;
  cyan: ColorGroup;
  sky: ColorGroup;
  blue: ColorGroup;
  indigo: ColorGroup;
  violet: ColorGroup;
  purple: ColorGroup;
  fuchsia: ColorGroup;
  pink: ColorGroup;
  switch: SwitchColors;
};

export type Theme = {
  colors: ThemeColors;
  spacing: Record<string, number>;
  size: Record<string, number>;
  borderRadius: Record<string, number>;
  fonts: {
    regular: string;
    medium: string;
    semiBold: string;
    bold: string;
  };
};

export type ColorPalette = Exclude<keyof ThemeColors, "surface" | "switch" | "gradients">;
