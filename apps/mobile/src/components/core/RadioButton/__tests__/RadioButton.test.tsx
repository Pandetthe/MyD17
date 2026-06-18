import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import RadioButton from "../RadioButton";
import { RadioButtonGroup } from "../RadioButton.context";

function ControlledGroup({
  initial,
  onChange,
}: {
  initial: string;
  onChange?: (v: string) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <RadioButtonGroup
      value={value}
      onValueChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    >
      <RadioButton label="Option A" value="a" />
      <RadioButton label="Option B" value="b" />
    </RadioButtonGroup>
  );
}

describe("RadioButtonGroup", () => {
  it("renders its children", () => {
    render(<ControlledGroup initial="a" />);
    expect(screen.getByText("Option A")).toBeTruthy();
    expect(screen.getByText("Option B")).toBeTruthy();
  });
});

describe("RadioButton", () => {
  it("renders its label", () => {
    render(<ControlledGroup initial="a" />);
    expect(screen.getByText("Option A")).toBeTruthy();
    expect(screen.getByText("Option B")).toBeTruthy();
  });

  it("marks the selected option as checked", () => {
    render(<ControlledGroup initial="a" />);
    const radioA = screen.getByRole("radio", { name: "Option A" });
    expect(radioA.props.accessibilityState?.checked).toBe(true);
  });

  it("marks the unselected option as not checked", () => {
    render(<ControlledGroup initial="a" />);
    const radioB = screen.getByRole("radio", { name: "Option B" });
    expect(radioB.props.accessibilityState?.checked).toBe(false);
  });

  it("calls onValueChange with the pressed value", () => {
    const onChange = jest.fn();
    render(<ControlledGroup initial="a" onChange={onChange} />);
    fireEvent.press(screen.getByRole("radio", { name: "Option B" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("switches selection when a different option is pressed", () => {
    render(<ControlledGroup initial="a" />);
    fireEvent.press(screen.getByRole("radio", { name: "Option B" }));
    expect(screen.getByRole("radio", { name: "Option B" }).props.accessibilityState?.checked).toBe(
      true,
    );
    expect(screen.getByRole("radio", { name: "Option A" }).props.accessibilityState?.checked).toBe(
      false,
    );
  });

  it("does not call onValueChange when disabled", () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <RadioButtonGroup value="a" onValueChange={onChange}>
        <RadioButton label="Disabled" value="d" disabled />
      </RadioButtonGroup>,
    );
    fireEvent.press(getByRole("radio", { name: "Disabled" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("has accessibilityRole radio", () => {
    render(<ControlledGroup initial="a" />);
    const radio = screen.getByRole("radio", { name: "Option A" });
    expect(radio.props.accessibilityRole).toBe("radio");
  });

  it("renders label on the trailing side when position is trailing", () => {
    render(
      <RadioButtonGroup value="" onValueChange={jest.fn()}>
        <RadioButton label="Trail" value="t" position="trailing" />
      </RadioButtonGroup>,
    );
    expect(screen.getByText("Trail")).toBeTruthy();
  });
});
