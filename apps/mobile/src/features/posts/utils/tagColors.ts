import type { TailwindColorName } from "@repo/types";

type TagColorTokens = { bg: string; border: string; text: string };
type TagColorEntry = { light: TagColorTokens; dark: TagColorTokens };

const TAG_COLOR_MAP: Record<TailwindColorName, TagColorEntry> = {
  red: {
    light: { bg: "#FFEBEB", border: "#DA3036", text: "#822025" },
    dark: { bg: "rgba(239,68,68,0.15)", border: "#F87171", text: "#FEF2F2" },
  },
  orange: {
    light: { bg: "#FFF4E5", border: "#F97316", text: "#C2410C" },
    dark: { bg: "rgba(249,115,22,0.15)", border: "#FB923C", text: "#FFF7ED" },
  },
  amber: {
    light: { bg: "#FFF6E5", border: "#FF990A", text: "#693F05" },
    dark: { bg: "rgba(245,158,11,0.15)", border: "#FCD34D", text: "#FFFBEB" },
  },
  yellow: {
    light: { bg: "#FEFCE8", border: "#CA8A04", text: "#713F12" },
    dark: { bg: "rgba(234,179,8,0.15)", border: "#FDE047", text: "#FEFCE8" },
  },
  lime: {
    light: { bg: "#F7FEE7", border: "#65A30D", text: "#3F6212" },
    dark: { bg: "rgba(132,204,22,0.15)", border: "#BEF264", text: "#F7FEE7" },
  },
  green: {
    light: { bg: "#DCF6DC", border: "#388E4A", text: "#126427" },
    dark: { bg: "rgba(34,197,94,0.15)", border: "#86EFAC", text: "#F0FDF4" },
  },
  emerald: {
    light: { bg: "#ECFDF5", border: "#10B981", text: "#065F46" },
    dark: { bg: "rgba(16,185,129,0.15)", border: "#6EE7B7", text: "#ECFDF5" },
  },
  teal: {
    light: { bg: "#D5F7F1", border: "#0D8C7D", text: "#085E53" },
    dark: { bg: "rgba(6,182,212,0.15)", border: "#67E8F9", text: "#ECFEFF" },
  },
  cyan: {
    light: { bg: "#ECFEFF", border: "#06B6D4", text: "#155E75" },
    dark: { bg: "rgba(6,182,212,0.15)", border: "#67E8F9", text: "#ECFEFF" },
  },
  sky: {
    light: { bg: "#F0F9FF", border: "#0EA5E9", text: "#075985" },
    dark: { bg: "rgba(14,165,233,0.15)", border: "#7DD3FC", text: "#F0F9FF" },
  },
  blue: {
    light: { bg: "#CDE7FF", border: "#1065AF", text: "#212C3F" },
    dark: { bg: "rgba(16,101,175,0.15)", border: "#93C5FD", text: "#EFF6FF" },
  },
  indigo: {
    light: { bg: "#EEF2FF", border: "#6366F1", text: "#4338CA" },
    dark: { bg: "rgba(99,102,241,0.15)", border: "#A5B4FC", text: "#EEF2FF" },
  },
  violet: {
    light: { bg: "#F5F3FF", border: "#8B5CF6", text: "#5B21B6" },
    dark: { bg: "rgba(139,92,246,0.15)", border: "#C4B5FD", text: "#F5F3FF" },
  },
  purple: {
    light: { bg: "#F3E7FC", border: "#763DA9", text: "#5F2D84" },
    dark: { bg: "rgba(118,61,169,0.15)", border: "#D8B4FE", text: "#FAF5FF" },
  },
  fuchsia: {
    light: { bg: "#FDF4FF", border: "#D946EF", text: "#86198F" },
    dark: { bg: "rgba(217,70,239,0.15)", border: "#F0ABFC", text: "#FDF4FF" },
  },
  pink: {
    light: { bg: "#FEE7F1", border: "#DE2670", text: "#6C1E3F" },
    dark: { bg: "rgba(236,72,153,0.15)", border: "#F9A8D4", text: "#FDF2F8" },
  },
  rose: {
    light: { bg: "#FFE4E6", border: "#F43F5E", text: "#BE123C" },
    dark: { bg: "rgba(244,63,94,0.15)", border: "#FDA4AF", text: "#FFF1F2" },
  },
};

export function getTagColors(
  name: TailwindColorName,
  mode: "light" | "dark" = "light",
): TagColorTokens {
  return (TAG_COLOR_MAP[name] ?? TAG_COLOR_MAP.blue)[mode];
}
