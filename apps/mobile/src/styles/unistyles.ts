import { lightTheme, LightTheme } from "@/styles/themes/light";
import { StyleSheet } from "react-native-unistyles";

type AppThemes = {
  light: LightTheme;
};

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  themes: { light: lightTheme },
});
