import { useEffect, useState } from "react";
import { View } from "react-native";
import Setting from "@/components/Setting";
import { Theme } from "@/styles/themes/theme";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { BellIcon, BellRingIcon, InfoIcon, LanguagesIcon, MoonIcon } from "lucide-react-native";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";

type RootParamList = {
  notifications: undefined;
};

export default function Settings() {
  const navigation = useNavigation<NavigationProp<RootParamList>>();

  const [darkMode, setDarkMode] = useState(0);
  const [notifications] = useState(0);

  const darkModeClick = () => {
    setDarkMode(1 - darkMode);
    if (darkMode === 1) {
      UnistylesRuntime.setTheme("light");
    } else {
      UnistylesRuntime.setTheme("dark");
    }
  };

  const notificationsClick = () => navigation.navigate("notifications");

  useEffect(() => {
    if (UnistylesRuntime.themeName === "dark") {
      setDarkMode(1);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Setting icon={MoonIcon} text="Tryb ciemny" onPress={darkModeClick} value={darkMode} />
      <Setting
        icon={notifications === 1 ? BellRingIcon : BellIcon}
        text="Zarządzaj powiadomieniami"
        onPress={notificationsClick}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  container: {
    flex: 1,
    flexDirection: "column",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
}));
