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

// ─── Tag color ────────────────────────────────────────────────────────────────

export type TailwindColorName =
  | "red" | "orange" | "amber" | "yellow" | "lime" | "green" | "emerald"
  | "teal" | "cyan" | "sky" | "blue" | "indigo" | "violet" | "purple"
  | "fuchsia" | "pink" | "rose";

export type LocationValue = "s1.38" | "s2.41" | "s3.20" | "s4.21";

export type DayOfWeek =
  | "monday" | "tuesday" | "wednesday" | "thursday"
  | "friday" | "saturday" | "sunday";
