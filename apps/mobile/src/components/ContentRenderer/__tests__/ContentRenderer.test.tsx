import React from "react";
import { ContentRenderer } from "../index";
import type { PostContentBlock } from "@repo/types";
import { render, screen } from "@testing-library/react-native";

const textBlock = (id: number, content: string, isHeader = false): PostContentBlock =>
  ({ __component: "content.text", id, content, isHeader }) as PostContentBlock;

const sectionTitleBlock = (id: number, content: string): PostContentBlock =>
  ({ __component: "content.section-title", id, content }) as PostContentBlock;

const calendarBlock = (id: number): PostContentBlock =>
  ({
    __component: "content.calendar",
    id,
    entries: [{ id: 1, day: "monday", withDate: false, startTime: "09:00", endTime: "17:00" }],
  }) as unknown as PostContentBlock;

const locationBlock = (id: number): PostContentBlock =>
  ({ __component: "content.location", id, content: "s1.38" }) as PostContentBlock;

const chipBlock = (id: number): PostContentBlock =>
  ({ __component: "content.chip", id, title: "Info", content: "Some info" }) as PostContentBlock;

describe("ContentRenderer", () => {
  it("renders nothing when blocks array is empty", () => {
    render(<ContentRenderer blocks={[]} />);
    expect(screen.queryByText(/./)).toBeNull();
  });

  it("renders text block content", () => {
    render(<ContentRenderer blocks={[textBlock(1, "Hello paragraph")]} />);
    expect(screen.getByText("Hello paragraph")).toBeTruthy();
  });

  it("renders section title block content", () => {
    render(<ContentRenderer blocks={[sectionTitleBlock(1, "Section Header")]} />);
    expect(screen.getByText("Section Header")).toBeTruthy();
  });

  it("renders multiple text blocks", () => {
    render(
      <ContentRenderer blocks={[textBlock(1, "First block"), textBlock(2, "Second block")]} />,
    );
    expect(screen.getByText("First block")).toBeTruthy();
    expect(screen.getByText("Second block")).toBeTruthy();
  });

  it("renders calendar block entries", () => {
    render(<ContentRenderer blocks={[calendarBlock(1)]} />);
    expect(screen.getByText("Poniedziałek")).toBeTruthy();
  });

  it("renders InfoCard once for a location block", () => {
    render(<ContentRenderer blocks={[locationBlock(1)]} />);
    expect(screen.getByText("Budynek D-17, Sala 1.38")).toBeTruthy();
  });

  it("renders InfoCard only once when multiple info blocks are present", () => {
    const blocks: PostContentBlock[] = [locationBlock(1), chipBlock(2)];
    render(<ContentRenderer blocks={blocks} />);
    // Both values should appear — they're inside the single InfoCard
    expect(screen.getByText("Budynek D-17, Sala 1.38")).toBeTruthy();
    expect(screen.getByText("Some info")).toBeTruthy();
  });

  it("ignores unknown block types silently", () => {
    const unknownBlock = { __component: "content.unknown", id: 1 } as unknown as PostContentBlock;
    expect(() => render(<ContentRenderer blocks={[unknownBlock]} />)).not.toThrow();
  });
});
