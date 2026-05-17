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
  rose: {
    extraDark: "#4C0519",
    dark: "#BE123C",
    main: "#F43F5E",
    light: "#FECDD3",
    extraLight: "#FFF1F2",
  },
  orange: {
    extraDark: "#431407",
    dark: "#C2410C",
    main: "#F97316",
    light: "#FED7AA",
    extraLight: "#FFF7ED",
  },
  amber: {
    extraDark: "#341C00",
    dark: "#693F05",
    main: "#F6A200",
    light: "#FFDD8F",
    extraLight: "#FFF6E5",
  },
  yellow: {
    extraDark: "#422006",
    dark: "#A16207",
    main: "#EAB308",
    light: "#FEF08A",
    extraLight: "#FEFCE8",
  },
  lime: {
    extraDark: "#1A2E05",
    dark: "#4D7C0F",
    main: "#84CC16",
    light: "#D9F99D",
    extraLight: "#F7FEE7",
  },
  green: {
    extraDark: "#032E15",
    dark: "#126427",
    main: "#5EA500",
    light: "#D8F999",
    extraLight: "#DCF6DC",
  },
  emerald: {
    extraDark: "#022C22",
    dark: "#047857",
    main: "#10B981",
    light: "#A7F3D0",
    extraLight: "#ECFDF5",
  },
  teal: {
    extraDark: "#053345",
    dark: "#085E53",
    main: "#0092B8",
    light: "#A2F4FD",
    extraLight: "#ECFEFF",
  },
  cyan: {
    extraDark: "#083344",
    dark: "#0E7490",
    main: "#06B6D4",
    light: "#A5F3FC",
    extraLight: "#ECFEFF",
  },
  sky: {
    extraDark: "#082F49",
    dark: "#0369A1",
    main: "#0EA5E9",
    light: "#BAE6FD",
    extraLight: "#F0F9FF",
  },
  blue: {
    extraDark: "#172554",
    dark: "#1D4ED8",
    main: "#3B82F6",
    light: "#BFDBFE",
    extraLight: "#EFF6FF",
  },
  indigo: {
    extraDark: "#1E1B4B",
    dark: "#4338CA",
    main: "#6366F1",
    light: "#C7D2FE",
    extraLight: "#EEF2FF",
  },
  violet: {
    extraDark: "#2E1065",
    dark: "#6D28D9",
    main: "#8B5CF6",
    light: "#DDD6FE",
    extraLight: "#F5F3FF",
  },
  purple: {
    extraDark: "#432155",
    dark: "#5F2D84",
    main: "#763DA9",
    light: "#EDDBF9",
    extraLight: "#F3E7FC",
  },
  fuchsia: {
    extraDark: "#4A044E",
    dark: "#A21CAF",
    main: "#D946EF",
    light: "#F5D0FE",
    extraLight: "#FDF4FF",
  },
  pink: {
    extraDark: "#3C1827",
    dark: "#6C1E3F",
    main: "#DE2670",
    light: "#FCD5E7",
    extraLight: "#FEE7F1",
  },
} as const;

type NestedStringValues<T> = T extends string
  ? T
  : T extends object
    ? NestedStringValues<T[keyof T]>
    : never;
export type AppColor = NestedStringValues<typeof colors>;
