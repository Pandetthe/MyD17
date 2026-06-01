import React from "react";
import { InfoCard } from "../index";
import type { PostContentBlock } from "@repo/types";
import { fireEvent, render, screen } from "@testing-library/react-native";

const locationBlock = (content: string): PostContentBlock =>
  ({ __component: "content.location", id: 1, content }) as PostContentBlock;

const dateTimeBlock = (startDateTime: string, endDateTime?: string): PostContentBlock =>
  ({
    __component: "content.event-date-time",
    id: 2,
    startDateTime,
    endDateTime,
  }) as PostContentBlock;

const chipBlock = (id: number, title: string, content: string): PostContentBlock =>
  ({ __component: "content.chip", id, title, content, icon: null }) as unknown as PostContentBlock;

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

  it("opens map for first-floor location", () => {
    const onLocationPress = jest.fn();
    render(<InfoCard blocks={[locationBlock("s1.38")]} onLocationPress={onLocationPress} />);

    fireEvent.press(screen.getByTestId("info-card-location-link"));

    expect(onLocationPress).toHaveBeenCalledWith("1.38");
  });

  it("renders all four known locations correctly", () => {
    const expected: Record<string, string> = {
      "s1.38": "Budynek D-17, Sala 1.38",
      "s2.41": "Budynek D-17, Sala 2.41",
      "s3.20": "Budynek D-17, Sala 3.20",
      "s4.21": "Budynek D-17, Sala 4.21",
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
});
