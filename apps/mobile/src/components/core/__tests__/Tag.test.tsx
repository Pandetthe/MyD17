import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import Tag from "../Tag.component";

jest.mock("@/hooks/usePressAnimation", () => ({
  usePressAnimation: () => ({ animStyle: {}, onPressIn: jest.fn(), onPressOut: jest.fn() }),
}));

describe("Tag", () => {
  it("renders the tag text", () => {
    render(<Tag text="#sport" />);
    expect(screen.getByText("#sport")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    render(<Tag text="#events" onPress={onPress} />);
    fireEvent.press(screen.getByText("#events"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders without crashing when onPress is not provided", () => {
    expect(() => render(<Tag text="#science" />)).not.toThrow();
  });

  it("renders without crashing with a named color", () => {
    expect(() => render(<Tag text="#sport" color="red" />)).not.toThrow();
  });

  it("renders without crashing when selected", () => {
    expect(() => render(<Tag text="#sport" selected />)).not.toThrow();
  });

  it("renders with primary color by default (no crash)", () => {
    expect(() => render(<Tag text="#default" color="primary" />)).not.toThrow();
  });
});
