import React from "react";
import { View } from "react-native";
import type {
  ContentChip,
  ContentEventDateTime,
  ContentLocation,
  LocationValue,
  PostContentBlock,
} from "@/features/posts/types/post.types";
import type { Theme } from "@/styles/themes/theme";
import { InfoRow } from "./InfoRow";
import { Clock, Info, MapPin } from "lucide-react-native";
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
};

export function InfoCard({ blocks }: Props) {
  const { theme } = useUnistyles();
  const safeBlocks = blocks ?? [];

  const locationBlock = safeBlocks.find(
    (b): b is ContentLocation => b.__component === "content.location",
  );
  const dateTimeBlock = safeBlocks.find(
    (b): b is ContentEventDateTime => b.__component === "content.event-date-time",
  );
  const chipBlocks = safeBlocks.filter((b): b is ContentChip => b.__component === "content.chip");

  if (!locationBlock && !dateTimeBlock && chipBlocks.length === 0) return null;

  return (
    <View style={styles.card}>
      {locationBlock && locationBlock.content && (
        <InfoRow
          icon={<MapPin size={18} color={theme.colors.primary.main} />}
          label="LOKALIZACJA"
          value={LOCATION_LABELS[locationBlock.content] ?? locationBlock.content}
        />
      )}
      {dateTimeBlock && dateTimeBlock.startDateTime && (
        <InfoRow
          icon={<Clock size={18} color={theme.colors.primary.main} />}
          label="KIEDY"
          value={
            dateTimeBlock.endDateTime
              ? `${formatDateTime(dateTimeBlock.startDateTime)} – ${formatDateTime(dateTimeBlock.endDateTime)}`
              : formatDateTime(dateTimeBlock.startDateTime)
          }
        />
      )}
      {chipBlocks.map((chip) => (
        <InfoRow
          key={chip.id}
          icon={<Info size={18} color={theme.colors.primary.main} />}
          label={chip.title ?? ""}
          value={chip.content ?? ""}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  card: {
    backgroundColor: theme.colors.dark.background.main,
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.md,
    padding: 21,
    gap: theme.spacing.md,
    shadowColor: theme.colors.dark.main,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
}));
