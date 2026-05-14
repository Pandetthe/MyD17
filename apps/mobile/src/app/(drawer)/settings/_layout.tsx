import Header from "@/components/core/Header.component";
import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ header: () => <Header />, animation: "slide_from_right" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
    </Stack>
  );
}
