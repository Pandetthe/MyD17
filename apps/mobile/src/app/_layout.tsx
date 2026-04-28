import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import React from "react";
import { Drawer } from "expo-router/drawer";
import "@/styles/unistyles";
import Icon from "@/components/core/Icon.component";
import {HomeIcon, SettingsIcon} from "lucide-react-native";

export default function Layout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Drawer
        screenOptions={{
          drawerContentContainerStyle: {
            flex: 1,
          }
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: "Ekran główny",
            drawerIcon: () => (
                <Icon icon={HomeIcon} hasBackground={false}/>
            )
          }}
        />
        <Drawer.Screen
            name="settings"
            options={{
              drawerLabel: "Ustawienia",
              drawerIcon: () => (
                  <Icon icon={SettingsIcon} hasBackground={false}/>
              ),
              drawerItemStyle: {
                marginTop: "auto",
              }
            }}
        />
      </Drawer>
    </ThemeProvider>
  );
}
