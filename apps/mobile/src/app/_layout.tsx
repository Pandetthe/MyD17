import "@/styles/unistyles";
import React, { useEffect, useState } from "react";
import { Appearance } from "react-native";
import { useNativeSetup } from "@/hooks/useNativeSetup";
import { THEME_STORAGE_KEY } from "@/lib/storageKeys";
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
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UnistylesRuntime } from "react-native-unistyles";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [loaded, error] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });
  const [themeReady, setThemeReady] = useState(false);

  useNativeSetup(loaded || !!error);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      let theme: "light" | "dark";
      if (saved === "light" || saved === "dark") {
        theme = saved;
      } else {
        theme = Appearance.getColorScheme() === "dark" ? "dark" : "light";
      }
      UnistylesRuntime.setTheme(theme);
      setThemeReady(true);
    });
  }, []);

  useEffect(() => {
    if ((loaded || error) && themeReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, themeReady]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={DefaultTheme}>
          <QueryProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(drawer)" />
              <Stack.Screen name="post" options={{ animation: "slide_from_right" }} />
              <Stack.Screen name="preview" />
            </Stack>
          </QueryProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
