import React from "react";
import { TagFilterBar } from "../TagFilterBar.component";
import type { Tag } from "@repo/types";
import { render, screen, fireEvent } from "@testing-library/react-native";

jest.mock("@/hooks/usePressAnimation", () => ({
  usePressAnimation: () => ({ animStyle: {}, onPressIn: jest.fn(), onPressOut: jest.fn() }),
}));
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock("@/lib/tagColor", () => ({ tagColor: () => "primary" }));

const makeTags = (): Tag[] =>
  [
    { id: 1, title: "sport", color: null },
    { id: 2, title: "events", color: null },
    { id: 3, title: "science", color: null },
  ] as unknown as Tag[];

describe("TagFilterBar", () => {
  it("renders all tag pills", () => {
    render(
      <TagFilterBar
        tags={makeTags()}
        selectedTagIds={[]}
        onSelect={jest.fn()}
        onClear={jest.fn()}
      />,
    );
    expect(screen.getByText("#sport")).toBeTruthy();
    expect(screen.getByText("#events")).toBeTruthy();
    expect(screen.getByText("#science")).toBeTruthy();
  });

  it("does not render the clear button when no tags are selected", () => {
    render(
      <TagFilterBar
        tags={makeTags()}
        selectedTagIds={[]}
        onSelect={jest.fn()}
        onClear={jest.fn()}
      />,
    );
    expect(screen.queryByTestId("tag-filter-clear")).toBeNull();
  });

  it("renders the clear button when at least one tag is selected", () => {
    render(
      <TagFilterBar
        tags={makeTags()}
        selectedTagIds={[1]}
        onSelect={jest.fn()}
        onClear={jest.fn()}
      />,
    );
    expect(screen.getByTestId("tag-filter-clear")).toBeTruthy();
  });

  it("calls onSelect with the tag id when a tag is pressed", () => {
    const onSelect = jest.fn();
    render(
      <TagFilterBar
        tags={makeTags()}
        selectedTagIds={[]}
        onSelect={onSelect}
        onClear={jest.fn()}
      />,
    );
    fireEvent.press(screen.getByText("#sport"));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it("calls onSelect with the correct id for different tags", () => {
    const onSelect = jest.fn();
    render(
      <TagFilterBar
        tags={makeTags()}
        selectedTagIds={[]}
        onSelect={onSelect}
        onClear={jest.fn()}
      />,
    );
    fireEvent.press(screen.getByText("#events"));
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it("calls onClear when the clear pill is pressed", () => {
    const onClear = jest.fn();
    render(
      <TagFilterBar
        tags={makeTags()}
        selectedTagIds={[1]}
        onSelect={jest.fn()}
        onClear={onClear}
      />,
    );
    fireEvent.press(screen.getByTestId("tag-filter-clear"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("renders without crashing when tags array is empty", () => {
    render(<TagFilterBar tags={[]} selectedTagIds={[]} onSelect={jest.fn()} onClear={jest.fn()} />);
    expect(screen.queryByTestId("tag-filter-bar")).toBeTruthy();
  });
});
