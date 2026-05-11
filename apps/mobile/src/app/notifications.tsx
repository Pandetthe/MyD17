import { useState } from "react";
import { View } from "react-native";
import Notification from "@/components/core/Notification.component";
import { Theme } from "@/styles/themes/theme";
import { StyleSheet } from "react-native-unistyles";

export default function Notifications() {
  const [events, setEvents] = useState(0);
  const [achievements, setAchievements] = useState(0)

  const eventsClick = () => {
    setEvents(1 - events);
  }

  const achievementsClick = () => {
    setAchievements(1 - achievements);
  }

  return (
    <View style={styles.container}>
      <Notification text="Wydarzenia" onPress={eventsClick} value={events} color={"green"}/>
      <Notification text="Osiągnięcia" onPress={achievementsClick} value={achievements} color={"amber"}/>
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