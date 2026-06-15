import { Alert, Linking, Platform } from "react-native";
import type { ContentEventDateTime, Post } from "@repo/types";
import * as Calendar from "expo-calendar";

export type CalendarEvent = {
  label: string;
  startDate: Date;
  endDate: Date;
};

export function extractCalendarEvents(post: Post): CalendarEvent[] {
  const blocks = post.content ?? [];
  const events: CalendarEvent[] = [];

  for (const block of blocks) {
    if (block.__component !== "content.event-date-time") continue;
    const dt = block as ContentEventDateTime;
    if (!dt.startDateTime) continue;

    const start = new Date(dt.startDateTime);
    const end = dt.endDateTime
      ? new Date(dt.endDateTime)
      : new Date(start.getTime() + 60 * 60 * 1000);

    const label = formatEventLabel(start, end);
    events.push({ label, startDate: start, endDate: end });
  }

  return events;
}

function formatEventLabel(start: Date, end: Date): string {
  const dateStr = start.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const startTime = start.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
  const endTime = end.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
  return `${dateStr}, ${startTime} – ${endTime}`;
}

async function getDefaultCalendarId(): Promise<string | null> {
  if (Platform.OS === "ios") {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    return defaultCalendar?.id ?? null;
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const local = calendars.find(
    (c) => c.accessLevel === Calendar.CalendarAccessLevel.OWNER && c.allowsModifications,
  );
  return local?.id ?? calendars[0]?.id ?? null;
}

export async function addEventToCalendar(
  event: CalendarEvent,
  meta: { title: string; notes?: string | null },
): Promise<void> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== Calendar.PermissionStatus.GRANTED) {
    Alert.alert("Brak uprawnień", "Przyznaj dostęp do kalendarza w ustawieniach telefonu.", [
      { text: "Anuluj", style: "cancel" },
      { text: "Otwórz ustawienia", onPress: () => void Linking.openSettings() },
    ]);
    return;
  }

  const calendarId = await getDefaultCalendarId();
  if (!calendarId) {
    Alert.alert("Błąd", "Nie znaleziono kalendarza na urządzeniu.");
    return;
  }

  await Calendar.createEventAsync(calendarId, {
    title: meta.title,
    startDate: event.startDate,
    endDate: event.endDate,
    notes: meta.notes ?? undefined,
  });

  Alert.alert("Dodano do kalendarza", `"${meta.title}" zostało dodane do Twojego kalendarza.`);
}
