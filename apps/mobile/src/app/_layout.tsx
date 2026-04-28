import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import React from "react";
import { Drawer } from "expo-router/drawer";
import "@/styles/unistyles";
import Icon from "@/components/core/Icon.component";
import {SettingsIcon} from "lucide-react-native";

export default function Layout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Drawer>
        <Drawer.Screen
            name="settings"
            options={{
              drawerLabel: "Ustawienia",
              drawerIcon: () => (
                  <Icon icon={SettingsIcon} hasBackground={false}/>
              ),
            }}
        />
      </Drawer>
    </ThemeProvider>
  );
}
