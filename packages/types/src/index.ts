// Auto-generated — run `pnpm generate` in packages/types after Strapi schema changes
export type { components } from "./generated";
import type { components } from "./generated";

type Schema = components["schemas"];

// ─── Strapi REST response wrappers ───────────────────────────────────────────

export type StrapiListResponse<T> = {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export type StrapiSingleResponse<T> = {
  data: T;
  meta: Record<string, never>;
};

// ─── Content types ────────────────────────────────────────────────────────────

export type Post = Schema["Post"];
export type Tag = Schema["Tag"];

export type PostAuthor = {
  id?: string | number;
  documentId?: string;
  username?: string;
  avatar?: {
    url?: string;
    width?: number;
    height?: number;
  };
};
export type StaticInformation = Schema["StaticInformation"];
export type InformationPage = Schema["InformationPage"];

export type ContentText = Schema["ContentTextComponent"];
export type ContentSectionTitle = Schema["ContentSectionTitleComponent"];
export type ContentChip = Schema["ContentChipComponent"];
export type ContentLocation = Schema["ContentLocationComponent"];
export type ContentEventDateTime = Schema["ContentEventDateTimeComponent"];
export type ContentCalendar = Schema["ContentCalendarComponent"];
export type CalendarEntry = Schema["CalendarEntryCalendarEntryComponent"];

export type PostContentBlock =
  | ContentText
  | ContentSectionTitle
  | ContentChip
  | ContentLocation
  | ContentEventDateTime
  | ContentCalendar;

export type ContactPage = Schema["Contact"];

// ─── Tag color ────────────────────────────────────────────────────────────────

export type TailwindColorName =
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose";

export type LocationValue =
  | "s1.4"
  | "s1.5"
  | "s1.6"
  | "s1.10"
  | "s1.11"
  | "s1.12"
  | "s1.16"
  | "s1.17"
  | "s1.18"
  | "s1.19"
  | "s1.20"
  | "s1.21"
  | "s1.22"
  | "s1.23"
  | "s1.26"
  | "s1.27"
  | "s1.28"
  | "s1.33"
  | "s1.35"
  | "s1.36"
  | "s1.38"
  | "s1.39"
  | "s2.2"
  | "s2.6"
  | "s2.7"
  | "s2.9"
  | "s2.10"
  | "s2.11"
  | "s2.12"
  | "s2.13"
  | "s2.14"
  | "s2.17"
  | "s2.18"
  | "s2.19"
  | "s2.20"
  | "s2.21"
  | "s2.22"
  | "s2.24"
  | "s2.25"
  | "s2.26"
  | "s2.27"
  | "s2.28"
  | "s2.29"
  | "s2.30"
  | "s2.31"
  | "s2.32"
  | "s2.33"
  | "s2.34"
  | "s2.35"
  | "s2.36"
  | "s2.40"
  | "s2.41"
  | "s2.42"
  | "s2.47"
  | "s2.48"
  | "s3.2"
  | "s3.7"
  | "s3.8"
  | "s3.9"
  | "s3.10"
  | "s3.11"
  | "s3.12"
  | "s3.13"
  | "s3.19"
  | "s3.22"
  | "s3.23"
  | "s3.24"
  | "s3.26"
  | "s3.27a"
  | "s3.27b"
  | "s3.27c"
  | "s3.27d"
  | "s3.27e"
  | "s3.30"
  | "s3.31"
  | "s3.32"
  | "s3.33"
  | "s3.34"
  | "s3.35"
  | "s3.36"
  | "s3.37"
  | "s3.38"
  | "s3.39"
  | "s3.40"
  | "s3.41"
  | "s3.42"
  | "s3.43"
  | "s3.44"
  | "s3.45"
  | "s3.46"
  | "s3.47"
  | "s3.48"
  | "s3.49"
  | "s3.50"
  | "s3.51"
  | "s3.53"
  | "s3.54"
  | "s3.55"
  | "s3.56"
  | "s3.57"
  | "s3.58"
  | "s3.59"
  | "s3.61"
  | "s3.62"
  | "s4.2"
  | "s4.7"
  | "s4.8"
  | "s4.9"
  | "s4.10"
  | "s4.11"
  | "s4.12"
  | "s4.13"
  | "s4.14"
  | "s4.19"
  | "s4.22"
  | "s4.23"
  | "s4.25"
  | "s4.26"
  | "s4.27"
  | "s4.28"
  | "s4.29"
  | "s4.30"
  | "s4.31"
  | "s4.34"
  | "s4.35"
  | "s4.36"
  | "s4.37"
  | "s4.38"
  | "s4.39"
  | "s4.40"
  | "s4.41"
  | "s4.42"
  | "s4.43"
  | "s4.44"
  | "s4.45"
  | "s4.46"
  | "s4.47"
  | "s4.48"
  | "s4.49"
  | "s4.50"
  | "s4.51"
  | "s4.52"
  | "s4.53"
  | "s4.54"
  | "s4.55"
  | "s4.57"
  | "s4.58";

export type ChipVariant = NonNullable<ContentChip["variant"]>;

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";
