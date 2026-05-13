import Header from "@/components/core/Header.component";
import { useRouter, Stack } from "expo-router";
import { Platform } from "react-native";

export default function SettingsLayout() {
  const router = useRouter();

  return (
    <Stack screenOptions={{ header: () => <Header />, animation: Platform.OS === "web" ? "shift" : "slide_from_right" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="notifications" options={{ header: () => <Header onBack={router.back} /> }} />
    </Stack>
  );
}
