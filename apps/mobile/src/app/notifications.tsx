import { useState } from "react";
import { View } from "react-native";
import Notification from "@/components/core/Notification.component";
import { Theme } from "@/styles/themes/theme";
import { StyleSheet } from "react-native-unistyles";

export default function Notifications() {
  const [notifications, setNotifications] = useState({
    events: false,
    achievements: false,
    longTag: false,
  });

  const toggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleAll = () => {
    const allOn = Object.values(notifications).every(Boolean);

    const nextValue = !allOn;

    setNotifications({
      events: nextValue,
      achievements: nextValue,
      longTag: nextValue,
    });
  };

  return (
    <View style={styles.container}>
      <Notification text="Wszystkie" onPress={() => toggleAll()} value={Object.values(notifications).every(Boolean) ? 1 : 0} color = "red" />
      <Notification text="Wydarzenia" onPress={() => toggle("events")} value={notifications.events ? 1 : 0} color={"green"}/>
      <Notification text="Osiągnięcia" onPress={() => toggle("achievements")} value={notifications.achievements ? 1 : 0} color={"amber"}/>
      <Notification text="ABCDEABCDEABCDEABCDEABCDEABCDEABCDEABCDE" onPress={() => toggle("longTag")} value={notifications.longTag ? 1 : 0} color={"purple"}/>
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  container: {
    flex: 0,
    justifyContent: "space-between",
    flexDirection: "column",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
}));