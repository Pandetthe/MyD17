export type Color = {
  extraDark: string;
  dark: string;
  main: string;
  light: string;
  extraLight: string;
  surface?: string;
  muted?: string;
};

export const colors = {
  surface: "#F8FAFC",
  white: "#FFFFFF",
  core: {
    extraDark: "#151C28",
    dark: "#212C3F",
    muted: "#53535D",
    main: "#1065AF",
    light: "#CDE7FF",
    extraLight: "#85B9E5",
    surface: "#F8FAFC",
  },
  red: {
    extraDark: "#3D1719",
    dark: "#822025",
    main: "#DA3036",
    light: "#F8BABA",
    extraLight: "#FFEBEB",
  },
  amber: {
    extraDark: "#341C00",
    dark: "#693F05",
    main: "#FF990A",
    light: "#FFDD8F",
    extraLight: "#FFF6E5",
  },
  green: {
    extraDark: "#0F2C17",
    dark: "#126427",
    main: "#388E4A",
    light: "#C8F1C9",
    extraLight: "#DCF6DC",
  },
  teal: {
    extraDark: "#062923",
    dark: "#085E53",
    main: "#0D8C7D",
    light: "#BEF4EB",
    extraLight: "#D5F7F1",
  },
  purple: {
    extraDark: "#432155",
    dark: "#5F2D84",
    main: "#763DA9",
    light: "#EDDBF9",
    extraLight: "#F3E7FC",
  },
  pink: {
    extraDark: "#3C1827",
    dark: "#6C1E3F",
    main: "#DE2670",
    light: "#FCD5E7",
    extraLight: "#FEE7F1",
  },
} as const;
