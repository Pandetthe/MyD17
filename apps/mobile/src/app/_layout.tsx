import "@/styles/unistyles";
import React, { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import DrawerContent from "@/components/core/DrawerContent.component";
import Header from "@/components/core/Header.component";
import { QueryProvider } from "@/providers/QueryProvider";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UnistylesRuntime } from "react-native-unistyles";

export const THEME_STORAGE_KEY = "theme_preference";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.8, 310);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === "light" || saved === "dark") {
        UnistylesRuntime.setAdaptiveThemes(false);
        UnistylesRuntime.setTheme(saved);
      }
    });
  }, []);

  const [loaded, error] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={DefaultTheme}>
        <QueryProvider>
          <StatusBar style="auto" />
          <Drawer
            drawerContent={() => <DrawerContent />}
            screenOptions={{
              header: () => <Header />,
              drawerType: "front",
              drawerStyle: {
                backgroundColor: "transparent",
                width: drawerWidth,
              },
            }}
          >
            <Drawer.Screen name="index" />
            <Drawer.Screen name="d17map" />
            <Drawer.Screen name="information" />
            <Drawer.Screen name="settings" />
            <Drawer.Screen name="post/[id]" options={{ headerShown: false }} />
          </Drawer>
        </QueryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
