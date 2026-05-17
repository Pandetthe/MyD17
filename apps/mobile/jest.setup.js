/* eslint-disable @typescript-eslint/no-require-imports */
/* global jest, require */
import "@testing-library/jest-native/extend-expect";

jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));
jest.mock("react-native-worklets", () => require("react-native-worklets/lib/module/mock"));
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

const mockTheme = {
  colors: {
    surface: "#F8FAFC",
    primary: {
      main: "#1065AF",
      text: { primary: "#212C3F", secondary: "#53535D" },
      background: { main: "#F8FAFC", accent: "#BAD7F1" },
    },
    dark: {
      main: "#212C3F",
      text: { primary: "#212C3F", secondary: "#151C28" },
      background: { main: "#FFFFFF", accent: "#F8FAFC" },
    },
    gradients: { settings: [] },
    red: {
      main: "#E7000B",
      text: { primary: "#460809", secondary: "#822025" },
      background: { main: "#FEF2F2", accent: "#FFC9C9" },
    },
    amber: {
      main: "#F6A200",
      text: { primary: "#341C00", secondary: "#693F05" },
      background: { main: "#FFF6E5", accent: "#FFDD8F" },
    },
    green: {
      main: "#5EA500",
      text: { primary: "#032E15", secondary: "#126427" },
      background: { main: "#DCF6DC", accent: "#D8F999" },
    },
    teal: {
      main: "#0092B8",
      text: { primary: "#053345", secondary: "#085E53" },
      background: { main: "#ECFEFF", accent: "#A2F4FD" },
    },
    purple: {
      main: "#763DA9",
      text: { primary: "#432155", secondary: "#5F2D84" },
      background: { main: "#F3E7FC", accent: "#EDDBF9" },
    },
    pink: {
      main: "#DE2670",
      text: { primary: "#3C1827", secondary: "#6C1E3F" },
      background: { main: "#FEE7F1", accent: "#FCD5E7" },
    },
    switch: { on: "#1065AF", off: "#BAD7F1" },
  },
  spacing: { none: 0, xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32 },
  borderRadius: { none: 0, sm: 12, md: 16, lg: 24, full: 9999 },
  size: { xxs: 8, xs: 12, sm: 16, md: 20, lg: 28, xl: 40 },
  fonts: {
    regular: "Montserrat-Regular",
    medium: "Montserrat-Medium",
    semiBold: "Montserrat-SemiBold",
    bold: "Montserrat-Bold",
  },
};

jest.mock("react-native-unistyles", () => ({
  useUnistyles: () => ({ theme: mockTheme, breakpoint: "sm" }),
  StyleSheet: {
    create: (fn) => (typeof fn === "function" ? fn(mockTheme) : fn),
  },
}));

const mockIcon = () => null;
jest.mock("lucide-react-native", () => ({
  Bell: mockIcon,
  BookOpen: mockIcon,
  Building: mockIcon,
  Calendar: mockIcon,
  CalendarPlus: mockIcon,
  Clock: mockIcon,
  Coffee: mockIcon,
  FileText: mockIcon,
  GraduationCap: mockIcon,
  Heart: mockIcon,
  Info: mockIcon,
  Library: mockIcon,
  LucideIcon: mockIcon,
  Mail: mockIcon,
  MapPin: mockIcon,
  Mic: mockIcon,
  Music: mockIcon,
  ParkingSquare: mockIcon,
  Phone: mockIcon,
  ScrollText: mockIcon,
  Share2: mockIcon,
  Trophy: mockIcon,
  Users: mockIcon,
  Wifi: mockIcon,
}));

const { act } = require("@testing-library/react-native");

afterEach(async () => {
  await act(async () => {
    await new Promise((resolve) => setImmediate(resolve));
  });
});

