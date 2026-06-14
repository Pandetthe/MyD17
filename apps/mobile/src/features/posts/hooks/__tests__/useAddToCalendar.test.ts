import { extractCalendarEvents } from "../useAddToCalendar";
import type { Post } from "@repo/types";

jest.mock("expo-calendar", () => ({}));

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
