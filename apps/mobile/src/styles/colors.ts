/**
 * Single source of truth for the entire color system.
 *
 * Structure:
 *   palette   – raw hex values, organised by hue
 *   colorGroups – semantic light/dark variants per palette hue
 *   colors    – backwards-compat export (used by DrawerContent etc.)
 */

// ─── Raw palette ──────────────────────────────────────────────────────────────

const core = {
  extraDark: "#0F1A28",
  dark:      "#1E2D3F",
  muted:     "#64748B",
  main:      "#1065AF",
  light:     "#2563EB",
  extraLight:"#93C5FD",
  disabled:  "#BFDBFE",
  surface:   "#EFF6FF",
} as const;

const red = {
  extraDark: "#450A0A",
  dark:      "#991B1B",
  main:      "#EF4444",
  light:     "#FCA5A5",
  extraLight:"#FEF2F2",
} as const;

const amber = {
  extraDark: "#431407",
  dark:      "#92400E",
  main:      "#F59E0B",
  light:     "#FCD34D",
  extraLight:"#FFFBEB",
} as const;

const green = {
  extraDark: "#052E16",
  dark:      "#166534",
  main:      "#22C55E",
  light:     "#86EFAC",
  extraLight:"#F0FDF4",
} as const;

const teal = {
  extraDark: "#083344",
  dark:      "#0E7490",
  main:      "#06B6D4",
  light:     "#67E8F9",
  extraLight:"#ECFEFF",
} as const;

const purple = {
  extraDark: "#2E1065",
  dark:      "#5B21B6",
  main:      "#8B5CF6",
  light:     "#C4B5FD",
  extraLight:"#EDE9FE",
} as const;

const pink = {
  extraDark: "#500724",
  dark:      "#9D174D",
  main:      "#EC4899",
  light:     "#F9A8D4",
  extraLight:"#FDF2F8",
} as const;

// ─── Semantic color groups ────────────────────────────────────────────────────
//
// Each hue exposes a `light` and `dark` variant that maps directly onto the
// ColorGroup shape used by the theme.  Defining both variants here means you
// only need to touch this file when tweaking any colour.

type RawColor = {
  extraDark: string; dark: string; main: string; light: string; extraLight: string;
};

function makeColorGroup(c: RawColor, darkBgMain: string) {
  return {
    light: {
      main: c.main,
      text:       { primary: c.extraDark, secondary: c.dark },
      background: { main: c.extraLight,   accent: c.light },
    },
    dark: {
      main: c.main,
      text:       { primary: c.extraLight, secondary: c.light },
      background: { main: darkBgMain,     accent: c.light },
    },
  } as const;
}

export const colorGroups = {
  red:    makeColorGroup(red,    "rgba(239,68,68,0.10)"),
  amber:  makeColorGroup(amber,  "rgba(245,158,11,0.10)"),
  green:  makeColorGroup(green,  "rgba(34,197,94,0.10)"),
  teal:   makeColorGroup(teal,   "rgba(6,182,212,0.10)"),
  purple: makeColorGroup(purple, "rgba(139,92,246,0.10)"),
  pink:   makeColorGroup(pink,   "rgba(236,72,153,0.10)"),
} as const;

// ─── Backwards-compatible export ──────────────────────────────────────────────

/** @deprecated prefer `colorGroups` for semantic usage, `palette.*` for raw values */
export const colors = {
  surface: core.surface,
  white:   "#FFFFFF",
  core,
  red,
  amber,
  green,
  teal,
  purple,
  pink,
} as const;

// Keep the old Color type for any remaining consumers
export type Color = RawColor & { surface?: string; muted?: string };

type NestedStringValues<T> = T extends string
  ? T
  : T extends object
    ? NestedStringValues<T[keyof T]>
    : never;
export type AppColor = NestedStringValues<typeof colors>;
