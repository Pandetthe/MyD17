import { useState } from "react";
import { View } from "react-native";
import Setting from "@/components/Setting";
import { useGuardedRouter } from "@/hooks/useGuardedRouter";
import { THEME_STORAGE_KEY } from "@/lib/storageKeys";
import { Theme } from "@/styles/themes/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BellRingIcon, MoonIcon } from "lucide-react-native";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";

export default function Settings() {
  const router = useGuardedRouter();
  const [darkMode, setDarkMode] = useState(UnistylesRuntime.themeName === "dark");

  const darkModeClick = () => {
    const next = darkMode ? "light" : "dark";
    AsyncStorage.setItem(THEME_STORAGE_KEY, next);
    UnistylesRuntime.setAdaptiveThemes(false);
    UnistylesRuntime.setTheme(next);
    setDarkMode(!darkMode);
  };

  return (
    <View testID="settings-screen" style={styles.container}>
      <Setting
        testID="setting-dark-mode"
        icon={MoonIcon}
        text="Tryb ciemny"
        onPress={darkModeClick}
        value={darkMode}
      />
      <Setting
        testID="setting-notifications"
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
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
}));
