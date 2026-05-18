import React from "react";
import { View } from "react-native";
import { Card } from "@/components/core/Card.component";
import TextCore from "@/components/core/Text.component";
import { colors } from "@/styles/colors";
import type { Theme } from "@/styles/themes/theme";
import type { CalendarEntry, ContentCalendar, DayOfWeek } from "@repo/types";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

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
  const { theme } = useUnistyles();
  const dayLabel = getDayLabel(entry);
  const fmt = (t?: string | null) => t?.slice(0, 5);
  const timeRange = [fmt(entry.startTime), fmt(entry.endTime)].filter(Boolean).join(" – ");
  const isClosed = timeRange.length === 0;

  const textColor = (dark || theme.mode === "dark") ? colors.core.extraLight : colors.core.dark;
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
  const { theme } = useUnistyles();
  const entries = block.entries ?? [];
  if (entries.length === 0) return null;
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
      {entries.map((entry) => (
        <CalendarEntryRow key={entry.id} entry={entry} dark={dark} />
      ))}
    </Card>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  outer: {
    width: "100%",
  },
  inner: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
}));
