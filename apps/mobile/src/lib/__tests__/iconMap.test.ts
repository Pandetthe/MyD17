import { getIcon } from "../iconMap";
import * as LucideIcons from "lucide-react-native";

// Override the global lucide mock so each icon has a distinct reference.
jest.mock("lucide-react-native", () => {
  const Bell = () => null;
  const HelpCircle = () => null;
  const Heart = () => null;
  const GraduationCap = () => null;
  return { Bell, HelpCircle, Heart, GraduationCap };
});

describe("getIcon", () => {
  it("returns the matching icon for a single-word kebab-case name", () => {
    expect(getIcon("bell")).toBe(LucideIcons.Bell);
  });

  it("converts multi-word kebab-case to PascalCase (help-circle → HelpCircle)", () => {
    expect(getIcon("help-circle")).toBe(LucideIcons.HelpCircle);
  });

  it("converts three-segment name to PascalCase (graduation-cap → GraduationCap)", () => {
    expect(getIcon("graduation-cap")).toBe(LucideIcons.GraduationCap);
  });

  it("returns HelpCircle by default when name is undefined", () => {
    expect(getIcon(undefined)).toBe(LucideIcons.HelpCircle);
  });

  it("returns HelpCircle by default when name is null", () => {
    expect(getIcon(null)).toBe(LucideIcons.HelpCircle);
  });

  it("returns HelpCircle when the icon name does not match any export", () => {
    expect(getIcon("no-such-icon-xyz")).toBe(LucideIcons.HelpCircle);
  });

  it("returns the provided fallback when name is undefined", () => {
    expect(getIcon(undefined, LucideIcons.Bell)).toBe(LucideIcons.Bell);
  });

  it("returns the provided fallback when the icon name is not found", () => {
    expect(getIcon("totally-unknown", LucideIcons.Heart)).toBe(LucideIcons.Heart);
  });
});
