import { useState } from "react";
import { View } from "react-native";
import Setting from "@/components/Setting";
import { THEME_STORAGE_KEY } from "@/lib/storageKeys";
import { Theme } from "@/styles/themes/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Bell, BellRingIcon, MoonIcon } from "lucide-react-native";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(UnistylesRuntime.themeName === "dark");
  const [notifications, setNotifications] = useState(false);

  const darkModeClick = () => {
    const next = darkMode ? "light" : "dark";
    AsyncStorage.setItem(THEME_STORAGE_KEY, next);
    UnistylesRuntime.setAdaptiveThemes(false);
    UnistylesRuntime.setTheme(next);
    setDarkMode(!darkMode);
  };

  const openNotifications = () => {
    setNotifications(!notifications);
  };

  return (
    <View style={styles.container}>
      <Setting icon={MoonIcon} text="Tryb ciemny" onPress={darkModeClick} value={darkMode} />
      <Setting
        icon={notifications ? BellRingIcon : Bell}
        text="Włącz powiadomienia"
        onPress={openNotifications}
        value={notifications}
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
