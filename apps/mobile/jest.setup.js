/* global jest */
import "@testing-library/jest-native/extend-expect";

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock"),
);
jest.mock("react-native-worklets", () =>
  require("react-native-worklets/lib/module/mock"),
);
jest.mock("react-native-unistyles", () => ({
  useUnistyles: () => ({
    theme: {},
    breakpoint: {},
  }),
}));
jest.mock("lucide-react-native", () => ({
  LucideIcon: () => null,
}));
