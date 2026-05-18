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
  primary: {
    main: string;
    text: string;
    subtext: string;
    bgAccent: string;
  };
  dark: {
    main: string;
    text: string;
    subtext: string;
    bg: string;
    bgAccent: string;
  };
  gradients: GradientGroup;
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

export type PaletteColor = "red" | "amber" | "green" | "teal" | "purple" | "pink";
export type ColorPalette = PaletteColor | "primary" | "dark";
