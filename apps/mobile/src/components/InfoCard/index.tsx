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

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const iconColor = dark ? colors.white : colors.core.main;

  const locationBlock = safeBlocks.find(
    (b): b is ContentLocation => b.__component === "content.location",
  );
  const dateTimeBlocks = safeBlocks.filter(
    (b): b is ContentEventDateTime => b.__component === "content.event-date-time",
  );
  const chipBlocks = safeBlocks.filter((b): b is ContentChip => b.__component === "content.chip");

  if (!locationBlock && dateTimeBlocks.length === 0 && chipBlocks.length === 0) return null;

  return (
    <Card
      circle="none"
      color="primary"
      gradient={theme.colors.gradients.posts}
      style={styles.outer}
      contentStyle={styles.inner}
    >
      {locationBlock && locationBlock.content && (
        <InfoRow
          icon={<MapPin size={18} color={iconColor} />}
          label="Lokalizacja"
          value={LOCATION_LABELS[locationBlock.content] ?? locationBlock.content}
          dark={dark}
        />
      )}

      {dateTimeBlocks.map((dtBlock, idx) => {
        const calEvent = blockToCalendarEvent(dtBlock);
        return (
          <View key={dtBlock.id ?? `dt-${idx}`} style={styles.dateGroup}>
            <InfoRow
              icon={<Clock size={18} color={iconColor} />}
              label="Kiedy"
              value={
                dtBlock.endDateTime
                  ? `${formatDateTime(dtBlock.startDateTime!)} – ${formatDateTime(dtBlock.endDateTime)}`
                  : formatDateTime(dtBlock.startDateTime!)
              }
              dark={dark}
            />
            {onAddToCalendar && calEvent && (
              <Button
                icon={CalendarPlus}
                text="Dodaj do kalendarza"
                color="primary"
                size="sm"
                style={styles.calendarButton}
                onPress={() => onAddToCalendar(calEvent)}
              />
            )}
          </View>
        );
      })}

      {chipBlocks.map((chip) => {
        const ChipIcon: LucideIcon = getIcon(chip.icon, Info);
        return (
          <InfoRow
            key={chip.id}
            icon={<ChipIcon size={18} color={iconColor} />}
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
  dateGroup: {
    gap: theme.spacing.sm,
  },
  calendarButton: {
    alignSelf: "flex-start",
  },
}));
