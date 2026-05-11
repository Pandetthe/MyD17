import { useState } from "react";
import { View } from "react-native";
import { THEME_STORAGE_KEY } from "@/app/_layout";
import Setting from "@/components/Setting";
import { Theme } from "@/styles/themes/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BellRingIcon, InfoIcon, LanguagesIcon, MoonIcon, Bell } from "lucide-react-native";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(UnistylesRuntime.themeName === "dark");
  const [notifications, setNotifications] = useState(0);

  const darkModeClick = () => {
    const next = darkMode ? "light" : "dark";
    AsyncStorage.setItem(THEME_STORAGE_KEY, next);
    UnistylesRuntime.setAdaptiveThemes(false);
    UnistylesRuntime.setTheme(next);
    setDarkMode(!darkMode);
  };
  const openNotifications = () => {
    setNotifications(1 - notifications);
  };
  const openLanguage = () => {
    alert("Languages"); // Placeholder
  };
  const openSubscriptions = () => {
    alert("Subscriptions"); // Placeholder
  };

  return (
    <View style={styles.container}>
      <Setting icon={MoonIcon} text="Tryb ciemny" onPress={darkModeClick} value={darkMode} />
      <Setting
        icon={notifications === 1 ? BellRingIcon : Bell}
        text="Włącz powiadomienia"
        onPress={openNotifications}
        value={notifications}
      />
      <Setting icon={LanguagesIcon} text="Język" onPress={openLanguage} />
      <Setting icon={InfoIcon} text="Zarządzaj subskrypcjami" onPress={openSubscriptions} />
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
