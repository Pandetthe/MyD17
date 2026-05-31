import { tagColor } from "../tagColor";

describe("tagColor", () => {
  it("returns 'primary' for null", () => {
    expect(tagColor(null)).toBe("primary");
  });

  it("returns 'primary' for undefined", () => {
    expect(tagColor(undefined)).toBe("primary");
  });

  it("returns 'primary' for an empty string", () => {
    expect(tagColor("")).toBe("primary");
  });

  it("returns 'primary' for a string not in palette", () => {
    expect(tagColor("blue")).toBe("primary");
    expect(tagColor("orange")).toBe("primary");
    expect(tagColor("primary")).toBe("primary");
  });

  it.each(["red", "amber", "green", "teal", "purple", "pink"] as const)(
    "returns '%s' for the valid palette color '%s'",
    (color) => {
      expect(tagColor(color)).toBe(color);
    },
  );
});
