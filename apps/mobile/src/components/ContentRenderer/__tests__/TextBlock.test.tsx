import React from "react";
import { TextBlock } from "../TextBlock";
import type { ContentText } from "@repo/types";
import { render, screen } from "@testing-library/react-native";

const makeBlock = (overrides: Partial<ContentText> = {}): ContentText =>
  ({
    __component: "content.text",
    id: 1,
    content: "Default text",
    isHeader: false,
    ...overrides,
  }) as ContentText;

describe("TextBlock", () => {
  it("renders body text content", () => {
    render(<TextBlock block={makeBlock({ content: "Body paragraph" })} />);
    expect(screen.getByText("Body paragraph")).toBeTruthy();
  });

  it("renders header content when isHeader is true", () => {
    render(<TextBlock block={makeBlock({ content: "Big Title", isHeader: true })} />);
    expect(screen.getByText("Big Title")).toBeTruthy();
  });

  it("renders empty string without crashing", () => {
    expect(() => render(<TextBlock block={makeBlock({ content: "" })} />)).not.toThrow();
  });
});
