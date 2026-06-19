import React, { useState } from "react";
import { Linking, View } from "react-native";
import { InfoRow } from "@/components/InfoCard/InfoRow";
import Button from "@/components/core/Button.component";
import { Card } from "@/components/core/Card.component";
import ConfirmModal from "@/components/core/ConfirmModal.component";
import {
  addEventToCalendar,
  CalendarPermissionError,
  CalendarNotFoundError,
  type CalendarEvent,
} from "@/features/posts/hooks/useAddToCalendar";
import { useGuardedRouter } from "@/hooks/useGuardedRouter";
import { getIcon } from "@/lib/iconMap";
import { colors } from "@/styles/colors";
import type { Theme } from "@/styles/themes/theme";
import type {
  ContentChip,
  ContentEventDateTime,
  ContentLocation,
  PostContentBlock,
} from "@repo/types";
import * as Clipboard from "expo-clipboard";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarPlus,
  Clock,
  Copy,
  Info,
  Map,
  MapPin,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { ScopedTheme, StyleSheet, useUnistyles } from "react-native-unistyles";

// Location values are "s" + the map room key (e.g. "s3.27a" → room "3.27a").
const ROOM_VALUE_RE = /^s(\d+\.\d+[a-z]?)$/;

function roomKeyFromLocation(location?: string | null): string | null {
  const match = location?.match(ROOM_VALUE_RE);
  return match ? match[1] : null;
}

function locationLabel(location: string): string {
  const room = roomKeyFromLocation(location);
  return room ? `Budynek D-17, Sala ${room}` : location;
}

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

function buildChipHandler(
  variant: string | undefined,
  content: string | undefined,
): (() => void) | undefined {
  if (!content) return undefined;
  switch (variant) {
    case "phone":
      return () => Linking.openURL(`tel:${content}`);
    case "email":
      return () => Linking.openURL(`mailto:${content}`);
    case "link":
      return () => Linking.openURL(content);
    case "copy":
      return () => Clipboard.setStringAsync(content);
    default:
      return undefined;
  }
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
  preview?: boolean;
  /** Title used for calendar events created from this card (post / page title). */
  eventTitle?: string;
  /** Optional notes attached to created calendar events. */
  eventNotes?: string | null;
};

function DarkButton({
  forceDark,
  ...props
}: React.ComponentProps<typeof Button> & { forceDark?: boolean }) {
  if (forceDark) {
    return (
      <ScopedTheme name="dark">
        <Button {...props} />
      </ScopedTheme>
    );
  }
  return <Button {...props} />;
}

type FeedbackInfo = {
  kind: "success" | "error";
  title: string;
  body?: string;
  icon: LucideIcon;
  action?: { label: string; onPress: () => void };
} | null;

export function InfoCard({ blocks, dark = false, preview = false, eventTitle, eventNotes }: Props) {
  const { theme } = useUnistyles();
  const router = useGuardedRouter();
  const safeBlocks = blocks ?? [];
  const [feedbackInfo, setFeedbackInfo] = useState<FeedbackInfo>(null);

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
  const mapRoom = roomKeyFromLocation(locationBlock?.content);
  const openLocation = mapRoom
    ? () => router.push({ pathname: "/d17map", params: { room: mapRoom } })
    : undefined;

  return (
    <Card
      circle="none"
      color="primary"
      gradient={gradient}
      style={styles.outer}
      contentStyle={styles.inner}
    >
      {locationBlock && locationBlock.content && (
        <View style={openLocation ? styles.dateRow : undefined}>
          <View style={openLocation ? styles.dateInfo : undefined}>
            <InfoRow
              icon={(c) => <MapPin size={18} color={c} />}
              label="Lokalizacja"
              value={locationLabel(locationBlock.content)}
              dark={dark}
            />
          </View>
          {openLocation && (
            <View pointerEvents={preview ? "none" : "box-none"}>
              <DarkButton
                forceDark={dark}
                icon={Map}
                color="dark"
                size="lg"
                style={styles.calendarButton}
                onPress={openLocation}
                testID="info-card-location-button"
              />
            </View>
          )}
        </View>
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
              {calEvent && (
                <View pointerEvents={preview ? "none" : "box-none"}>
                  <DarkButton
                    forceDark={dark}
                    icon={CalendarPlus}
                    color="dark"
                    size="lg"
                    style={styles.calendarButton}
                    testID="info-card-calendar-button"
                    onPress={async () => {
                      try {
                        await addEventToCalendar(calEvent, {
                          title: eventTitle ?? "Wydarzenie",
                          notes: eventNotes,
                        });
                        setFeedbackInfo({
                          kind: "success",
                          title: "Dodano do kalendarza",
                          body: calEvent.label,
                          icon: CalendarPlus,
                        });
                      } catch (e) {
                        if (e instanceof CalendarPermissionError) {
                          setFeedbackInfo({
                            kind: "error",
                            title: "Brak uprawnień",
                            body: "Przyznaj dostęp do kalendarza w ustawieniach telefonu.",
                            icon: AlertCircle,
                            action: {
                              label: "Otwórz ustawienia",
                              onPress: () => void Linking.openSettings(),
                            },
                          });
                        } else if (e instanceof CalendarNotFoundError) {
                          setFeedbackInfo({
                            kind: "error",
                            title: "Błąd",
                            body: "Nie znaleziono kalendarza na urządzeniu.",
                            icon: AlertCircle,
                          });
                        } else {
                          setFeedbackInfo({
                            kind: "error",
                            title: "Błąd",
                            body: "Nie udało się dodać wydarzenia do kalendarza.",
                            icon: AlertCircle,
                          });
                        }
                      }
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        );
      })}

      {chipBlocks.map((chip) => {
        const ChipIcon: LucideIcon = getIcon(chip.icon, Info);
        const rawHandler = buildChipHandler(chip.variant, chip.content);
        let ActionIcon: LucideIcon | undefined;
        if (chip.variant === "copy") ActionIcon = Copy;
        else if (chip.variant !== "normal" && rawHandler) ActionIcon = ArrowUpRight;

        const onPress =
          chip.variant === "copy" && rawHandler
            ? async () => {
                try {
                  await rawHandler();
                  setFeedbackInfo({
                    kind: "success",
                    title: "Skopiowano!",
                    body: chip.content ?? undefined,
                    icon: Copy,
                  });
                } catch {
                  setFeedbackInfo({
                    kind: "error",
                    title: "Błąd",
                    body: "Nie udało się skopiować.",
                    icon: AlertCircle,
                  });
                }
              }
            : rawHandler;

        return (
          <View key={chip.id} style={ActionIcon ? styles.dateRow : undefined}>
            <View style={ActionIcon ? styles.dateInfo : undefined}>
              <InfoRow
                icon={(c) => <ChipIcon size={18} color={c} />}
                label={chip.title ?? ""}
                value={chip.content ?? ""}
                dark={dark}
              />
            </View>
            {ActionIcon && onPress && (
              <View pointerEvents={preview ? "none" : "box-none"}>
                <DarkButton
                  forceDark={dark}
                  icon={ActionIcon}
                  color="dark"
                  size="lg"
                  style={styles.calendarButton}
                  onPress={onPress}
                  testID="chip-action-button"
                />
              </View>
            )}
          </View>
        );
      })}
      <ConfirmModal
        visible={feedbackInfo !== null}
        icon={feedbackInfo?.icon ?? Copy}
        title={feedbackInfo?.title ?? ""}
        body={feedbackInfo?.body}
        action={feedbackInfo?.action}
        onDismiss={() => setFeedbackInfo(null)}
      />
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
