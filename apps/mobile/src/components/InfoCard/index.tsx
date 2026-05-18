import React from "react";
import { View } from "react-native";
import Button from "@/components/core/Button.component";
import { Card } from "@/components/core/Card.component";
import { InfoRow } from "@/components/InfoCard/InfoRow";
import { getIcon } from "@/lib/iconMap";
import { colors } from "@/styles/colors";
import type { Theme } from "@/styles/themes/theme";
import type {
  ContentChip,
  ContentEventDateTime,
  ContentLocation,
  LocationValue,
  PostContentBlock,
} from "@repo/types";
import type { CalendarEvent } from "@/features/posts/hooks/useAddToCalendar";
import { CalendarPlus, Clock, Info, MapPin } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

const LOCATION_LABELS: Record<LocationValue, string> = {
  "s1.38": "Budynek D-17, Sala 1.38",
  "s2.41": "Budynek D-17, Sala 2.41",
  "s3.20": "Budynek D-17, Sala 3.20",
  "s4.21": "Budynek D-17, Sala 4.21",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}

function formatDateTimeRange(startStr: string, endStr?: string | null): string {
  const start = new Date(startStr);
  if (!endStr) return `${formatDate(start)}, ${formatTime(start)}`;
  const end = new Date(endStr);
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) return `${formatDate(start)}, ${formatTime(start)} – ${formatTime(end)}`;
  return `${formatDate(start)}, ${formatTime(start)} – ${formatDate(end)}, ${formatTime(end)}`;
}

function blockToCalendarEvent(dt: ContentEventDateTime): CalendarEvent | null {
  if (!dt.startDateTime) return null;
  const startDate = new Date(dt.startDateTime);
  const endDate = dt.endDateTime
    ? new Date(dt.endDateTime)
    : new Date(startDate.getTime() + 60 * 60 * 1000);
  const label = startDate.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return { label, startDate, endDate };
}

type Props = {
  blocks: PostContentBlock[];
  dark?: boolean;
  onAddToCalendar?: (event: CalendarEvent) => void;
};

export function InfoCard({ blocks, dark = false, onAddToCalendar }: Props) {
  const { theme } = useUnistyles();
  const safeBlocks = blocks ?? [];

  const locationBlock = safeBlocks.find(
    (b): b is ContentLocation => b.__component === "content.location",
  );
  const dateTimeBlocks = safeBlocks.filter(
    (b): b is ContentEventDateTime => b.__component === "content.event-date-time",
  );
  const chipBlocks = safeBlocks.filter((b): b is ContentChip => b.__component === "content.chip");

  if (!locationBlock && dateTimeBlocks.length === 0 && chipBlocks.length === 0) return null;

  const gradient = dark
    ? ([colors.core.extraDark, colors.core.dark] as const)
    : theme.colors.gradients.posts;

  return (
    <Card
      circle="none"
      color="primary"
      gradient={gradient}
      style={styles.outer}
      contentStyle={styles.inner}
    >
      {locationBlock && locationBlock.content && (
        <InfoRow
          icon={(c) => <MapPin size={18} color={c} />}
          label="Lokalizacja"
          value={LOCATION_LABELS[locationBlock.content] ?? locationBlock.content}
          dark={dark}
        />
      )}

      {dateTimeBlocks.map((dtBlock, idx) => {
        const calEvent = blockToCalendarEvent(dtBlock);
        return (
          <View key={dtBlock.id ?? `dt-${idx}`} style={styles.dateGroup}>
            <View style={styles.dateRow}>
              <View style={styles.dateInfo}>
                <InfoRow
                  icon={(c) => <Clock size={18} color={c} />}
                  label="Kiedy"
                  value={formatDateTimeRange(dtBlock.startDateTime!, dtBlock.endDateTime)}
                  dark={dark}
                />
              </View>
              {onAddToCalendar && calEvent && (
                <Button
                  icon={CalendarPlus}
                  color="dark"
                  size="lg"
                  style={styles.calendarButton}
                  onPress={() => onAddToCalendar(calEvent)}
                />
              )}
            </View>
          </View>
        );
      })}

      {chipBlocks.map((chip) => {
        const ChipIcon: LucideIcon = getIcon(chip.icon, Info);
        return (
          <InfoRow
            key={chip.id}
            icon={(c) => <ChipIcon size={18} color={c} />}
            label={chip.title ?? ""}
            value={chip.content ?? ""}
            dark={dark}
          />
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  outer: {
    width: "100%",
  },
  inner: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  dateGroup: {},
  dateRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  dateInfo: {
    flex: 1,
  },
  calendarButton: {
    flexShrink: 0,
    marginTop: 2,
  },
}));
