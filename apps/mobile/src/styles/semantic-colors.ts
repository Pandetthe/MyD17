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
    light: "#ACCDE9",
    extraLight: "#85B9E5",
    disabled: "#BAD7F1",
    surface: "#F8FAFC",
  },
  blue: {
    extraDark: "#06193a",
    dark: "#00418b",
    main: "#005be7",
    light: "#47a8ff",
    extraLight: "#eaf6ff",
  },
  red: {
    extraDark: "#330a11",
    dark: "#88151f",
    main: "#e2162a",
    light: "#ff565f",
    extraLight: "#ffe9ed",
  },
  amber: {
    extraDark: "#2a1700",
    dark: "#703e00",
    main: "#ff9300",
    light: "#ff9300",
    extraLight: "#fff3d5",
  },
  green: {
    extraDark: "#002608",
    dark: "#006717",
    main: "#009432",
    light: "#00ca50",
    extraLight: "#d8ffe4",
  },
  teal: {
    extraDark: "#00231b",
    dark: "#006354",
    main: "#00927f",
    light: "#00cfb7",
    extraLight: "#cbfff5",
  },
  purple: {
    extraDark: "#290c33",
    dark: "#642290",
    main: "#7d2bba",
    light: "#c472fb",
    extraLight: "#fbecff",
  },
  pink: {
    extraDark: "#310d1e",
    dark: "#76063f",
    main: "#e7006d",
    light: "#ff4d8d",
    extraLight: "#ffe9f4",
  },
} as const;
