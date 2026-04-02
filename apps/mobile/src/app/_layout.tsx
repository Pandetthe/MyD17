import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import React from "react";
import { Drawer } from "expo-router/drawer";

export default function Layout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Drawer />
    </ThemeProvider>
  );
}
