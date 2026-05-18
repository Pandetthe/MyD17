import { useState } from "react";
import { View } from "react-native";
import Setting from "@/components/Setting";
import { THEME_STORAGE_KEY } from "@/lib/storageKeys";
import { Theme } from "@/styles/themes/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { BellRingIcon, MoonIcon } from "lucide-react-native";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";

export default function Settings() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(UnistylesRuntime.themeName === "dark");

  const darkModeClick = () => {
    const next = darkMode ? "light" : "dark";
    AsyncStorage.setItem(THEME_STORAGE_KEY, next);
    UnistylesRuntime.setAdaptiveThemes(false);
    UnistylesRuntime.setTheme(next);
    setDarkMode(!darkMode);
  };

  return (
    <View style={styles.container}>
      <Setting icon={MoonIcon} text="Tryb ciemny" onPress={darkModeClick} value={darkMode} />
      <Setting
        icon={BellRingIcon}
        text="Zarządzaj powiadomieniami"
        onPress={() => router.push("/settings/notifications")}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
}));
