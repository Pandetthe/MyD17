import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import ConfirmModal from "../ConfirmModal.component";

jest.mock("@/hooks/usePressAnimation", () => ({
  usePressAnimation: () => ({ animStyle: {}, onPressIn: jest.fn(), onPressOut: jest.fn() }),
}));
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

const MockIcon = () => null;

describe("ConfirmModal", () => {
  it("renders title when visible", () => {
    render(
      <ConfirmModal visible icon={MockIcon} title="Success!" onDismiss={jest.fn()} />,
    );
    expect(screen.getByText("Success!")).toBeTruthy();
  });

  it("renders body text when provided", () => {
    render(
      <ConfirmModal
        visible
        icon={MockIcon}
        title="Title"
        body="Some explanation here."
        onDismiss={jest.fn()}
      />,
    );
    expect(screen.getByText("Some explanation here.")).toBeTruthy();
  });

  it("does not render body when body is omitted", () => {
    render(<ConfirmModal visible icon={MockIcon} title="Title" onDismiss={jest.fn()} />);
    expect(screen.queryByText("Some explanation here.")).toBeNull();
  });

  it("renders the OK button", () => {
    render(<ConfirmModal visible icon={MockIcon} title="Title" onDismiss={jest.fn()} />);
    expect(screen.getByText("OK")).toBeTruthy();
  });

  it("calls onDismiss when OK is pressed", () => {
    const onDismiss = jest.fn();
    render(<ConfirmModal visible icon={MockIcon} title="Title" onDismiss={onDismiss} />);
    fireEvent.press(screen.getByText("OK"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("renders the action button when action is provided", () => {
    render(
      <ConfirmModal
        visible
        icon={MockIcon}
        title="Title"
        onDismiss={jest.fn()}
        action={{ label: "Open Settings", onPress: jest.fn() }}
      />,
    );
    expect(screen.getByText("Open Settings")).toBeTruthy();
  });

  it("calls action.onPress and onDismiss when action button is pressed", () => {
    const onDismiss = jest.fn();
    const onActionPress = jest.fn();
    render(
      <ConfirmModal
        visible
        icon={MockIcon}
        title="Title"
        onDismiss={onDismiss}
        action={{ label: "Open Settings", onPress: onActionPress }}
      />,
    );
    fireEvent.press(screen.getByText("Open Settings"));
    expect(onActionPress).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("does not render action button when action is not provided", () => {
    render(<ConfirmModal visible icon={MockIcon} title="Title" onDismiss={jest.fn()} />);
    expect(screen.queryByText("Open Settings")).toBeNull();
  });
});
