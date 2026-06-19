import {
  extractCalendarEvents,
  addEventToCalendar,
  CalendarPermissionError,
  CalendarNotFoundError,
  type CalendarEvent,
} from "../useAddToCalendar";
import type { Post } from "@repo/types";

const mockRequestCalendarPermissionsAsync = jest.fn();
const mockGetDefaultCalendarAsync = jest.fn();
const mockGetCalendarsAsync = jest.fn();
const mockCreateEventAsync = jest.fn();

jest.mock("expo-calendar", () => ({
  requestCalendarPermissionsAsync: (...args: unknown[]) =>
    mockRequestCalendarPermissionsAsync(...args),
  getDefaultCalendarAsync: (...args: unknown[]) => mockGetDefaultCalendarAsync(...args),
  getCalendarsAsync: (...args: unknown[]) => mockGetCalendarsAsync(...args),
  createEventAsync: (...args: unknown[]) => mockCreateEventAsync(...args),
  PermissionStatus: { GRANTED: "granted", DENIED: "denied" },
  EntityTypes: { EVENT: "event" },
  CalendarAccessLevel: { OWNER: "owner" },
}));

const makeCalendarEvent = (overrides: Partial<CalendarEvent> = {}): CalendarEvent => ({
  label: "1 czerwca 2025, 10:00 – 11:00",
  startDate: new Date("2025-06-01T10:00:00.000Z"),
  endDate: new Date("2025-06-01T11:00:00.000Z"),
  ...overrides,
});

beforeEach(() => {
  mockRequestCalendarPermissionsAsync.mockReset();
  mockGetDefaultCalendarAsync.mockReset();
  mockGetCalendarsAsync.mockReset();
  mockCreateEventAsync.mockReset();
});

const makePost = (content: unknown[] = []): Post => ({ content }) as unknown as Post;

const makeDateBlock = (startDateTime: string, endDateTime?: string) => ({
  __component: "content.event-date-time",
  id: 1,
  startDateTime,
  endDateTime: endDateTime ?? null,
});

describe("extractCalendarEvents", () => {
  it("returns [] for a post with no content", () => {
    expect(extractCalendarEvents(makePost())).toEqual([]);
  });

  it("returns [] when content has no event-date-time blocks", () => {
    const content = [
      { __component: "content.text", id: 1, content: "hello" },
      { __component: "content.location", id: 2, content: "s1.38" },
    ];
    expect(extractCalendarEvents(makePost(content))).toEqual([]);
  });

  it("returns [] when startDateTime is missing", () => {
    const content = [{ __component: "content.event-date-time", id: 1, startDateTime: null }];
    expect(extractCalendarEvents(makePost(content))).toEqual([]);
  });

  it("parses startDateTime and defaults endDate to start + 1 hour", () => {
    const start = "2025-06-01T10:00:00.000Z";
    const result = extractCalendarEvents(makePost([makeDateBlock(start)]));
    expect(result).toHaveLength(1);
    expect(result[0].startDate).toEqual(new Date(start));
    expect(result[0].endDate.getTime()).toBe(new Date(start).getTime() + 60 * 60 * 1000);
  });

  it("uses provided endDateTime when given", () => {
    const start = "2025-06-01T10:00:00.000Z";
    const end = "2025-06-01T12:30:00.000Z";
    const result = extractCalendarEvents(makePost([makeDateBlock(start, end)]));
    expect(result).toHaveLength(1);
    expect(result[0].endDate).toEqual(new Date(end));
  });

  it("parses multiple event blocks in one post", () => {
    const content = [
      { ...makeDateBlock("2025-06-01T09:00:00.000Z"), id: 1 },
      { ...makeDateBlock("2025-06-02T14:00:00.000Z"), id: 2 },
    ];
    const result = extractCalendarEvents(makePost(content));
    expect(result).toHaveLength(2);
    expect(result[0].startDate).toEqual(new Date("2025-06-01T09:00:00.000Z"));
    expect(result[1].startDate).toEqual(new Date("2025-06-02T14:00:00.000Z"));
  });

  it("ignores non-event blocks mixed with event blocks", () => {
    const content = [
      { __component: "content.text", id: 1, content: "some text" },
      { ...makeDateBlock("2025-06-01T10:00:00.000Z"), id: 2 },
      { __component: "content.location", id: 3, content: "s1.38" },
    ];
    const result = extractCalendarEvents(makePost(content));
    expect(result).toHaveLength(1);
    expect(result[0].startDate).toEqual(new Date("2025-06-01T10:00:00.000Z"));
  });
});

describe("addEventToCalendar", () => {
  it("throws CalendarPermissionError when permission is denied", async () => {
    mockRequestCalendarPermissionsAsync.mockResolvedValue({ status: "denied" });
    await expect(
      addEventToCalendar(makeCalendarEvent(), { title: "Event" }),
    ).rejects.toBeInstanceOf(CalendarPermissionError);
  });

  it("throws CalendarNotFoundError when no calendar exists on device (iOS)", async () => {
    mockRequestCalendarPermissionsAsync.mockResolvedValue({ status: "granted" });
    mockGetDefaultCalendarAsync.mockResolvedValue(null);
    // Simulate iOS by falling through to getDefaultCalendarAsync returning null
    await expect(
      addEventToCalendar(makeCalendarEvent(), { title: "Event" }),
    ).rejects.toBeInstanceOf(CalendarNotFoundError);
  });

  it("resolves to true and calls createEventAsync on success (iOS)", async () => {
    mockRequestCalendarPermissionsAsync.mockResolvedValue({ status: "granted" });
    mockGetDefaultCalendarAsync.mockResolvedValue({ id: "cal-1" });
    mockCreateEventAsync.mockResolvedValue("event-id-123");

    const event = makeCalendarEvent();
    const result = await addEventToCalendar(event, { title: "My Event", notes: "Some notes" });

    expect(result).toBe(true);
    expect(mockCreateEventAsync).toHaveBeenCalledWith(
      "cal-1",
      expect.objectContaining({
        title: "My Event",
        startDate: event.startDate,
        endDate: event.endDate,
        notes: "Some notes",
      }),
    );
  });

  it("passes undefined notes when notes prop is null", async () => {
    mockRequestCalendarPermissionsAsync.mockResolvedValue({ status: "granted" });
    mockGetDefaultCalendarAsync.mockResolvedValue({ id: "cal-1" });
    mockCreateEventAsync.mockResolvedValue("event-id-456");

    await addEventToCalendar(makeCalendarEvent(), { title: "Event", notes: null });

    expect(mockCreateEventAsync).toHaveBeenCalledWith(
      "cal-1",
      expect.objectContaining({ notes: undefined }),
    );
  });
});
