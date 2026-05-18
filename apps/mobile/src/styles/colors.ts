// ─── Raw palette ──────────────────────────────────────────────────────────────

const core = {
  extraDark: "#0F1829",
  dark:      "#212C3F",
  muted:     "#64748B",
  main:      "#1065AF",
  light:     "#4977BB",
  extraLight:"#85B9E5",
  disabled:  "#C0D9EF",
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

// ─── Indexable palette (keyed by PaletteColor) ───────────────────────────────
export const palette = { red, amber, green, teal, purple, pink } as const;

export type RawColor = {
  extraDark: string; dark: string; main: string; light: string; extraLight: string;
};

// ─── Backwards-compatible flat export ────────────────────────────────────────
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

type NestedStringValues<T> = T extends string
  ? T
  : T extends object
    ? NestedStringValues<T[keyof T]>
    : never;
export type AppColor = NestedStringValues<typeof colors>;
