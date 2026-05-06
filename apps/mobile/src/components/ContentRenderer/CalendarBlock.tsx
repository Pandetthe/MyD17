import React from "react";
import { View } from "react-native";
import TextCore from "@/components/core/Text.component";
import type { Theme } from "@/styles/themes/theme";
import type { CalendarEntry, ContentCalendar, DayOfWeek } from "@repo/types";
import { StyleSheet } from "react-native-unistyles";

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Poniedziałek",
  tuesday: "Wtorek",
  wednesday: "Środa",
  thursday: "Czwartek",
  friday: "Piątek",
  saturday: "Sobota",
  sunday: "Niedziela",
};

function getDayLabel(entry: CalendarEntry): string {
  if (entry.withDate) {
    return entry.date
      ? new Date(entry.date).toLocaleDateString("pl-PL", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "";
  }
  return entry.day ? DAY_LABELS[entry.day] : "";
}

function CalendarEntryRow({ entry }: { entry: CalendarEntry }) {
  const dayLabel = getDayLabel(entry);
  const fmt = (t?: string | null) => t?.slice(0, 5);
  const timeRange = [fmt(entry.startTime), fmt(entry.endTime)].filter(Boolean).join(" – ");

  return (
    <View style={styles.row}>
      <TextCore variant="h3" weight="medium">
        {dayLabel}
      </TextCore>
      {timeRange.length > 0 && (
        <TextCore variant="body" style={styles.time}>
          {timeRange}
        </TextCore>
      )}
    </View>
  );
}

export function CalendarBlock({ block }: { block: ContentCalendar }) {
  const entries = block.entries ?? [];
  if (entries.length === 0) return null;
  return (
    <View style={styles.card}>
      {entries.map((entry) => (
        <CalendarEntryRow key={entry.id} entry={entry} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  card: {
    backgroundColor: theme.colors.dark.background.main,
    borderWidth: 1,
    borderColor: theme.colors.primary.background.accent,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  time: {
    fontSize: 14,
  },
}));
