export type ColorGroup = {
  main: string;
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
  settings: readonly [string, string];
  posts: readonly [string, string];
};

export type ThemeColors = {
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
};

export type Theme = {
  mode: "light" | "dark";
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
