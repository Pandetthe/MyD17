import { reactNativeConfig } from "@repo/eslint-config/react-native";

export default [
  { ignores: ["src/generated/**"] },
  ...reactNativeConfig,
];
