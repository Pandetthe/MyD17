import "@/styles/unistyles";
import React, { useEffect, useRef } from "react";
import { handleTokenRefresh } from "@/lib/pushNotifications";
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
import {
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  onTokenRefresh,
} from "@react-native-firebase/messaging";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UnistylesRuntime } from "react-native-unistyles";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const router = useRouter();
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  const [loaded, error] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?._source !== "foreground") return;
        const postId = data?.postId as string | undefined;
        if (postId) router.push({ pathname: "/post/[id]", params: { id: postId } });
      },
    );
    return () => notificationListener.current?.remove();
  }, []);

  useEffect(() => {
    return onTokenRefresh(getMessaging(), handleTokenRefresh);
  }, []);

  useEffect(() => {
    return onMessage(getMessaging(), async (msg) => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: msg.notification?.title,
          body: msg.notification?.body,
          data: { ...msg.data, _source: "foreground" },
        },
        trigger: null,
      });
    });
  }, []);

  useEffect(() => {
    return onNotificationOpenedApp(getMessaging(), (msg) => {
      const postId = msg.data?.postId as string | undefined;
      if (postId) router.push({ pathname: "/post/[id]", params: { id: postId } });
    });
  }, []);

  useEffect(() => {
    if (!loaded && !error) return;
    getInitialNotification(getMessaging()).then((msg) => {
      if (!msg) return;
      const postId = msg.data?.postId as string | undefined;
      if (postId)
        setTimeout(() => router.push({ pathname: "/post/[id]", params: { id: postId } }), 0);
    });
  }, [loaded, error]);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === "light" || saved === "dark") {
        UnistylesRuntime.setAdaptiveThemes(false);
        UnistylesRuntime.setTheme(saved);
      }
    });
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

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
            </Stack>
          </QueryProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
