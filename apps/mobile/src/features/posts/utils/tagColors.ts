import type { TailwindColorName } from "../types/post.types";

type TagColorTokens = { bg: string; border: string; text: string };

const TAG_COLOR_MAP: Record<TailwindColorName, TagColorTokens> = {
  red: { bg: "#FFEBEB", border: "#DA3036", text: "#822025" },
  orange: { bg: "#FFF4E5", border: "#F97316", text: "#C2410C" },
  amber: { bg: "#FFF6E5", border: "#FF990A", text: "#693F05" },
  yellow: { bg: "#FEFCE8", border: "#EAB308", text: "#854D0E" },
  lime: { bg: "#F7FEE7", border: "#84CC16", text: "#3F6212" },
  green: { bg: "#DCF6DC", border: "#388E4A", text: "#126427" },
  emerald: { bg: "#ECFDF5", border: "#10B981", text: "#065F46" },
  teal: { bg: "#D5F7F1", border: "#0D8C7D", text: "#085E53" },
  cyan: { bg: "#ECFEFF", border: "#06B6D4", text: "#155E75" },
  sky: { bg: "#F0F9FF", border: "#0EA5E9", text: "#075985" },
  blue: { bg: "#CDE7FF", border: "#1065AF", text: "#212C3F" },
  indigo: { bg: "#EEF2FF", border: "#6366F1", text: "#4338CA" },
  violet: { bg: "#F5F3FF", border: "#8B5CF6", text: "#5B21B6" },
  purple: { bg: "#F3E7FC", border: "#763DA9", text: "#5F2D84" },
  fuchsia: { bg: "#FDF4FF", border: "#D946EF", text: "#86198F" },
  pink: { bg: "#FEE7F1", border: "#DE2670", text: "#6C1E3F" },
  rose: { bg: "#FFE4E6", border: "#F43F5E", text: "#BE123C" },
};

export function getTagColors(name: TailwindColorName): TagColorTokens {
  return TAG_COLOR_MAP[name] ?? TAG_COLOR_MAP.blue;
}
