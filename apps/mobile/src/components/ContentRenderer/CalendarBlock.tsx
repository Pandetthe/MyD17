import React from "react";
import { View, type ColorValue } from "react-native";
import TextCore from "@/components/core/Text.component";
import { colors } from "@/styles/colors";
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

function CalendarEntryRow({ entry }: { entry: CalendarEntry; color?: ColorValue }) {
  const dayLabel = getDayLabel(entry);
  const fmt = (t?: string | null) => t?.slice(0, 5);
  const timeRange = [fmt(entry.startTime), fmt(entry.endTime)].filter(Boolean).join(" – ");
  const isClosed = timeRange.length === 0;

  return (
    <View style={styles.row}>
      <TextCore variant="h3" weight="semiBold" color={colors.core.extraLight}>
        {dayLabel}
      </TextCore>
      <TextCore
        variant="h3"
        weight="semiBold"
        color={isClosed ? colors.core.main : colors.core.extraLight}
        style={styles.time}
      >
        {isClosed ? "ZAMKNIĘTE" : timeRange}
      </TextCore>
    </View>
  );
}

export function CalendarBlock({ block }: { block: ContentCalendar; color?: ColorValue }) {
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
    backgroundColor: theme.colors.dark.main,
    borderWidth: 1,
    borderColor: colors.core.light,
    borderRadius: theme.borderRadius.md,
    padding: 20,
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  time: {},
}));
