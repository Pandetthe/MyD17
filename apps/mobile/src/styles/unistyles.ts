import { lightTheme, LightTheme } from "@/styles/themes/light";
import { StyleSheet } from "react-native-unistyles";

type AppThemes = {
  light: LightTheme;
};

declare module "react-native-unistyles" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  themes: { light: lightTheme },
});
