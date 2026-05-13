import React from "react";
import { CalendarBlock } from "../CalendarBlock";
import type { ContentCalendar, CalendarEntry } from "@repo/types";
import { render, screen } from "@testing-library/react-native";

const makeEntry = (overrides: Partial<CalendarEntry> = {}): CalendarEntry =>
  ({
    id: 1,
    day: "monday",
    withDate: false,
    startTime: null,
    endTime: null,
    ...overrides,
  }) as CalendarEntry;

const makeBlock = (entries: CalendarEntry[]): ContentCalendar =>
  ({ __component: "content.calendar", id: 1, entries }) as ContentCalendar;

describe("CalendarBlock", () => {
  it("renders nothing when entries is empty", () => {
    const { toJSON } = render(<CalendarBlock block={makeBlock([])} />);
    expect(toJSON()).toBeNull();
  });

  it("renders Polish day label for a weekly entry", () => {
    render(<CalendarBlock block={makeBlock([makeEntry({ day: "monday" })])} />);
    expect(screen.getByText("Poniedziałek")).toBeTruthy();
  });

  it("renders all seven day labels", () => {
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ] as const;
    const labels = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
    days.forEach((day, i) => {
      const { unmount } = render(<CalendarBlock block={makeBlock([makeEntry({ day })])} />);
      expect(screen.getByText(labels[i])).toBeTruthy();
      unmount();
    });
  });

  it("renders formatted date for a date-based entry", () => {
    const entry = makeEntry({ withDate: true, date: "2025-06-15", day: undefined });
    render(<CalendarBlock block={makeBlock([entry])} />);
    expect(screen.getByText(/15/)).toBeTruthy();
    expect(screen.getByText(/czerwca/i)).toBeTruthy();
  });

  it("renders time range when start and end time are set", () => {
    render(
      <CalendarBlock
        block={makeBlock([
          makeEntry({ day: "friday", startTime: "10:00:00", endTime: "18:00:00" }),
        ])}
      />,
    );
    expect(screen.getByText("10:00 – 18:00")).toBeTruthy();
  });

  it("renders ZAMKNIĘTE when no times are set", () => {
    render(<CalendarBlock block={makeBlock([makeEntry({ day: "sunday" })])} />);
    expect(screen.getByText("ZAMKNIĘTE")).toBeTruthy();
  });

  it("renders multiple entries", () => {
    render(
      <CalendarBlock
        block={makeBlock([
          makeEntry({ id: 1, day: "monday", startTime: "09:00:00", endTime: "17:00:00" }),
          makeEntry({ id: 2, day: "saturday" }),
        ])}
      />,
    );
    expect(screen.getByText("Poniedziałek")).toBeTruthy();
    expect(screen.getByText("Sobota")).toBeTruthy();
    expect(screen.getByText("ZAMKNIĘTE")).toBeTruthy();
  });
});
