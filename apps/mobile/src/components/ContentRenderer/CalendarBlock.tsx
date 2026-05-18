import React from "react";
import { View } from "react-native";
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

function CalendarEntryRow({ entry, dark }: { entry: CalendarEntry; dark: boolean }) {
  const dayLabel = getDayLabel(entry);
  const fmt = (t?: string | null) => t?.slice(0, 5);
  const timeRange = [fmt(entry.startTime), fmt(entry.endTime)].filter(Boolean).join(" – ");
  const isClosed = timeRange.length === 0;

  const textColor = dark ? colors.core.extraLight : colors.core.dark;
  const closedColor = colors.core.main;

  return (
    <View style={styles.row}>
      <TextCore variant="h3" weight="semiBold" color={textColor}>
        {dayLabel}
      </TextCore>
      <TextCore variant="h3" weight="semiBold" color={isClosed ? closedColor : textColor}>
        {isClosed ? "ZAMKNIĘTE" : timeRange}
      </TextCore>
    </View>
  );
}

export function CalendarBlock({ block, dark = false }: { block: ContentCalendar; dark?: boolean }) {
  const entries = block.entries ?? [];
  if (entries.length === 0) return null;
  return (
    <View style={[styles.card, dark ? styles.cardDark : styles.cardLight]}>
      {entries.map((entry) => (
        <CalendarEntryRow key={entry.id} entry={entry} dark={dark} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  card: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: 20,
    gap: theme.spacing.sm,
  },
  cardLight: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary.main,
  },
  cardDark: {
    backgroundColor: colors.core.dark,
    borderColor: colors.core.light,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
}));
