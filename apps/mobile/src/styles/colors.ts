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
    light: "#2198FF",
    extraLight: "#85B9E5",
    disabled: "#BAD7F1",
    surface: "#F8FAFC",
  },
  red: {
    extraDark: "#460809",
    dark: "#822025",
    main: "#E7000B",
    light: "#FFC9C9",
    extraLight: "#FEF2F2",
  },
  amber: {
    extraDark: "#341C00",
    dark: "#693F05",
    main: "#F6A200",
    light: "#FFDD8F",
    extraLight: "#FFF6E5",
  },
  green: {
    extraDark: "#032E15",
    dark: "#126427",
    main: "#5EA500",
    light: "#D8F999",
    extraLight: "#DCF6DC",
  },
  teal: {
    extraDark: "#053345",
    dark: "#085E53",
    main: "#0092B8",
    light: "#A2F4FD",
    extraLight: "#ECFEFF",
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

type NestedStringValues<T> = T extends string ? T : T extends object ? NestedStringValues<T[keyof T]> : never;
export type AppColor = NestedStringValues<typeof colors>;
