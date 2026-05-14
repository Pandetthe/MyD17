import { useEffect, useState } from "react";
import { View } from "react-native";
import Setting from "@/components/Setting";
import { Theme } from "@/styles/themes/theme";
import { BellRingIcon, InfoIcon, LanguagesIcon, MoonIcon, Bell } from "lucide-react-native";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(0);
  const [notifications, setNotifications] = useState(0);

  const darkModeClick = () => {
    setDarkMode(1 - darkMode);
    if (darkMode === 1) {
      UnistylesRuntime.setTheme("light");
    } else {
      UnistylesRuntime.setTheme("dark");
    }
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

  useEffect(() => {
    if (UnistylesRuntime.themeName === "dark") {
      setDarkMode(1);
    }
  }, []);

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
