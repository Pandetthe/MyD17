import React, { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import "@/styles/unistyles";
import DrawerContent from "@/components/core/DrawerContent.component";
import Header from "@/components/core/Header.component";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.8, 310);

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
    <ThemeProvider value={DefaultTheme}>
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
      </Drawer>
    </ThemeProvider>
  );
}
