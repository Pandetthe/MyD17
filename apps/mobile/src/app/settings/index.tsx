import { useEffect, useState } from "react";
import { View } from "react-native";
import Setting from "@/components/Setting";
import { Theme } from "@/styles/themes/theme";
import { useNavigation } from "@react-navigation/native";
import { BellRingIcon, InfoIcon, LanguagesIcon, MoonIcon } from "lucide-react-native";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";

export default function Settings() {
  const navigation = useNavigation();

  const [darkMode, setDarkMode] = useState(0);

  const darkModeClick = () => {
    setDarkMode(1 - darkMode);
    if (darkMode === 1) {
      UnistylesRuntime.setTheme("light");
    } else {
      UnistylesRuntime.setTheme("dark");
    }
  };
  const openNotifications = () => {
    // @ts-expect-error
    navigation.navigate("notifications");
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
      <Setting icon={MoonIcon} text="Dark Mode" onPress={darkModeClick} value={darkMode} />
      <Setting icon={BellRingIcon} text="Notifications" onPress={openNotifications} />
      <Setting icon={LanguagesIcon} text="Language" onPress={openLanguage} />
      <Setting icon={InfoIcon} text="Manage subscriptions" onPress={openSubscriptions} />
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  container: {
    flex: 0,
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
}));
