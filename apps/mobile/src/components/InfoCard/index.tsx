import React from "react";
import { View } from "react-native";
import Button from "@/components/core/Button.component";
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

type Props = {
  blocks: PostContentBlock[];
  dark?: boolean;
};

export function InfoCard({ blocks, dark = false }: Props) {
  const { theme } = useUnistyles();
  const safeBlocks = blocks ?? [];
  const iconColor = dark ? colors.white : colors.core.main;

  const locationBlock = safeBlocks.find(
    (b): b is ContentLocation => b.__component === "content.location",
  );
  const dateTimeBlock = safeBlocks.find(
    (b): b is ContentEventDateTime => b.__component === "content.event-date-time",
  );
  const chipBlocks = safeBlocks.filter((b): b is ContentChip => b.__component === "content.chip");

  if (!locationBlock && !dateTimeBlock && chipBlocks.length === 0) return null;

  return (
    <View style={[styles.card, dark ? styles.cardDark : styles.cardLight]}>
      {locationBlock && locationBlock.content && (
        <InfoRow
          icon={<MapPin size={18} color={iconColor} />}
          label="LOKALIZACJA"
          value={LOCATION_LABELS[locationBlock.content] ?? locationBlock.content}
          dark={dark}
        />
      )}
      {dateTimeBlock && dateTimeBlock.startDateTime && (
        <>
          <InfoRow
            icon={<Clock size={18} color={iconColor} />}
            label="KIEDY"
            value={
              dateTimeBlock.endDateTime
                ? `${formatDateTime(dateTimeBlock.startDateTime)} – ${formatDateTime(dateTimeBlock.endDateTime)}`
                : formatDateTime(dateTimeBlock.startDateTime)
            }
            dark={dark}
          />
          <Button
            icon={CalendarPlus}
            text="Dodaj do kalendarza"
            color="primary"
            size="sm"
            style={styles.calendarButton}
          />
        </>
      )}
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
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  card: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: 21,
    gap: theme.spacing.md,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  cardLight: {
    backgroundColor: theme.mode === "dark" ? colors.core.dark : colors.core.disabled,
    borderColor: colors.core.main,
    shadowColor: colors.core.main,
  },
  cardDark: {
    backgroundColor: colors.core.dark,
    borderColor: colors.core.main,
    shadowColor: colors.core.extraDark,
  },
  calendarButton: {
    alignSelf: "flex-start",
  },
}));
