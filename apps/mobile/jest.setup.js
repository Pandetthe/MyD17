/* global jest */
import "@testing-library/jest-native/extend-expect";

// Mock react-native first
jest.mock("react-native", () => ({
  View: "View",
  Text: "Text",
  Pressable: "Pressable",
  StyleSheet: {
    create: (styles) => styles,
  },
  Platform: {
    OS: "ios",
    select: (obj) => obj.ios,
  },
}));

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => ({
  useSharedValue: (val) => val,
  useAnimatedStyle: () => ({}),
  withTiming: (val) => val,
  Easing: {
    in: jest.fn(),
    out: jest.fn(),
  },
  Animated: {
    View: "View",
  },
}));

// Mock react-native-worklets
jest.mock("react-native-worklets", () => ({}));

// Mock react-native-unistyles
jest.mock("react-native-unistyles", () => ({
  useUnistyles: () => ({
    theme: {},
    breakpoint: {},
  }),
}));

// Mock lucide-react-native
jest.mock("lucide-react-native", () => ({
  LucideIcon: () => null,
}));
