import React from "react";
import { Linking } from "react-native";
import { InfoCard } from "@/components/InfoCard";
import {
  addEventToCalendar,
  CalendarPermissionError,
} from "@/features/posts/hooks/useAddToCalendar";
import type { PostContentBlock } from "@repo/types";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react-native";
import * as Clipboard from "expo-clipboard";

const mockPush = jest.fn();
jest.mock("@/hooks/useGuardedRouter", () => ({
  useGuardedRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    navigate: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock("@/features/posts/hooks/useAddToCalendar", () => ({
  ...jest.requireActual("@/features/posts/hooks/useAddToCalendar"),
  addEventToCalendar: jest.fn(),
}));

beforeEach(() => {
  mockPush.mockClear();
  (addEventToCalendar as jest.Mock).mockReset();
});

const locationBlock = (content: string): PostContentBlock =>
  ({ __component: "content.location", id: 1, content }) as PostContentBlock;

const dateTimeBlock = (startDateTime: string, endDateTime?: string): PostContentBlock =>
  ({
    __component: "content.event-date-time",
    id: 2,
    startDateTime,
    endDateTime,
  }) as PostContentBlock;

const chipBlock = (
  id: number,
  title: string,
  content: string,
  variant: "normal" | "phone" | "email" | "link" | "copy" = "normal",
): PostContentBlock =>
  ({
    __component: "content.chip",
    id,
    title,
    content,
    icon: null,
    variant,
  }) as unknown as PostContentBlock;

describe("InfoCard", () => {
  it("returns null when blocks array is empty", () => {
    const { toJSON } = render(<InfoCard blocks={[]} />);
    expect(toJSON()).toBeNull();
  });

  it("returns null when no info blocks are present", () => {
    const textBlock = { __component: "content.text", id: 1, content: "hi" } as PostContentBlock;
    const { toJSON } = render(<InfoCard blocks={[textBlock]} />);
    expect(toJSON()).toBeNull();
  });

  it("renders mapped location label", () => {
    render(<InfoCard blocks={[locationBlock("s1.38")]} />);
    expect(screen.getByText("Budynek D-17, Sala 1.38")).toBeTruthy();
    expect(screen.getByText("Lokalizacja")).toBeTruthy();
  });

  it("navigates to the map for the location's room on button press", () => {
    render(<InfoCard blocks={[locationBlock("s1.38")]} />);

    fireEvent.press(screen.getByTestId("info-card-location-button"));

    expect(mockPush).toHaveBeenCalledWith({ pathname: "/d17map", params: { room: "1.38" } });
  });

  it("navigates to the correct room for non-first-floor locations", () => {
    render(<InfoCard blocks={[locationBlock("s3.27a")]} />);

    fireEvent.press(screen.getByTestId("info-card-location-button"));

    expect(mockPush).toHaveBeenCalledWith({ pathname: "/d17map", params: { room: "3.27a" } });
  });

  it("renders mapped location labels across floors", () => {
    const expected: Record<string, string> = {
      "s1.38": "Budynek D-17, Sala 1.38",
      "s2.41": "Budynek D-17, Sala 2.41",
      "s3.27a": "Budynek D-17, Sala 3.27a",
      "s4.58": "Budynek D-17, Sala 4.58",
    };
    Object.entries(expected).forEach(([code, label]) => {
      const { unmount } = render(<InfoCard blocks={[locationBlock(code)]} />);
      expect(screen.getByText(label)).toBeTruthy();
      unmount();
    });
  });

  it("renders start datetime without end", () => {
    render(<InfoCard blocks={[dateTimeBlock("2025-06-15T10:00:00.000Z")]} />);
    expect(screen.getByText("Kiedy")).toBeTruthy();
    expect(screen.getByText(/15/)).toBeTruthy();
  });

  it("renders date range when end datetime is provided", () => {
    render(
      <InfoCard blocks={[dateTimeBlock("2025-06-15T10:00:00.000Z", "2025-06-15T18:00:00.000Z")]} />,
    );
    const kiedy = screen.getByText("Kiedy");
    expect(kiedy).toBeTruthy();
    // Both dates appear in the same value text (joined by " – ")
    const valueEl = screen.getByText(/–/);
    expect(valueEl).toBeTruthy();
  });

  it("renders chip with title and content", () => {
    render(<InfoCard blocks={[chipBlock(1, "Prowadzący", "Jan Kowalski")]} />);
    // chip.title is rendered as-is; textTransform:uppercase is visual-only
    expect(screen.getByText("Prowadzący")).toBeTruthy();
    expect(screen.getByText("Jan Kowalski")).toBeTruthy();
  });

  it("renders multiple chips", () => {
    render(
      <InfoCard blocks={[chipBlock(1, "Język", "Polski"), chipBlock(2, "Forma", "Wykład")]} />,
    );
    expect(screen.getByText("Język")).toBeTruthy();
    expect(screen.getByText("Polski")).toBeTruthy();
    expect(screen.getByText("Forma")).toBeTruthy();
    expect(screen.getByText("Wykład")).toBeTruthy();
  });

  it("renders all block types together", () => {
    render(
      <InfoCard
        blocks={[
          locationBlock("s3.20"),
          dateTimeBlock("2025-09-01T08:00:00.000Z"),
          chipBlock(1, "Typ", "Lab"),
        ]}
      />,
    );
    expect(screen.getByText("Budynek D-17, Sala 3.20")).toBeTruthy();
    expect(screen.getByText("Kiedy")).toBeTruthy();
    expect(screen.getByText("Typ")).toBeTruthy();
    expect(screen.getByText("Lab")).toBeTruthy();
  });

  it("phone chip opens tel: URL on press", () => {
    const spy = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    render(<InfoCard blocks={[chipBlock(1, "Telefon", "+48123456789", "phone")]} />);
    fireEvent.press(screen.getByTestId("chip-action-button"));
    expect(spy).toHaveBeenCalledWith("tel:+48123456789");
    spy.mockRestore();
  });

  it("email chip opens mailto: URL on press", () => {
    const spy = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    render(<InfoCard blocks={[chipBlock(1, "Email", "test@example.com", "email")]} />);
    fireEvent.press(screen.getByTestId("chip-action-button"));
    expect(spy).toHaveBeenCalledWith("mailto:test@example.com");
    spy.mockRestore();
  });

  it("link chip opens URL on press", () => {
    const spy = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    render(<InfoCard blocks={[chipBlock(1, "Strona", "https://example.com", "link")]} />);
    fireEvent.press(screen.getByTestId("chip-action-button"));
    expect(spy).toHaveBeenCalledWith("https://example.com");
    spy.mockRestore();
  });

  it("copy chip copies content to clipboard on press", async () => {
    const spy = jest.spyOn(Clipboard, "setStringAsync").mockResolvedValue(true);
    render(<InfoCard blocks={[chipBlock(1, "IBAN", "PL61109010140000071219812874", "copy")]} />);
    fireEvent.press(screen.getByTestId("chip-action-button"));
    await waitFor(() => expect(spy).toHaveBeenCalledWith("PL61109010140000071219812874"));
    spy.mockRestore();
  });

  it("normal chip has no action button", () => {
    render(<InfoCard blocks={[chipBlock(1, "Info", "some value", "normal")]} />);
    expect(screen.queryByTestId("chip-action-button")).toBeNull();
  });

  it("shows success modal when event is added to calendar", async () => {
    (addEventToCalendar as jest.Mock).mockResolvedValue(true);
    render(<InfoCard blocks={[dateTimeBlock("2025-06-15T10:00:00.000Z")]} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId("info-card-calendar-button"));
    });

    expect(await screen.findByText("Dodano do kalendarza")).toBeTruthy();
  });

  it("shows permission modal when calendar permission is denied", async () => {
    (addEventToCalendar as jest.Mock).mockRejectedValue(new CalendarPermissionError());
    render(<InfoCard blocks={[dateTimeBlock("2025-06-15T10:00:00.000Z")]} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId("info-card-calendar-button"));
    });

    expect(await screen.findByText("Brak uprawnień")).toBeTruthy();
    expect(screen.getByText("Otwórz ustawienia")).toBeTruthy();
  });

  it("shows error modal when addEventToCalendar throws", async () => {
    (addEventToCalendar as jest.Mock).mockRejectedValue(new Error("calendar failure"));
    render(<InfoCard blocks={[dateTimeBlock("2025-06-15T10:00:00.000Z")]} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId("info-card-calendar-button"));
    });

    expect(await screen.findByText("Błąd")).toBeTruthy();
  });
});
