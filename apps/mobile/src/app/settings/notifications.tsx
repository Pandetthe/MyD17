import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Notification from "@/components/core/Notification.component";
import SwitchCore from "@/components/core/Switch.component";
import TextCore from "@/components/core/Text.component";
import { strapiColorToPalette } from "@/lib/strapiColors";
import { ColorPalette, Theme } from "@/styles/themes/theme";
import { StyleSheet } from "react-native-unistyles";

type Tag = {
  id: number;
  title: string;
  color?: ColorPalette;
};

export default function Notifications() {
  const fetchTags = async (): Promise<Tag[]> => {
    const res = await fetch("http://localhost:1337/api/tags");
    const json = await res.json();

    return json.data.map((item: { id: number; title: string; color?: string }) => ({
      id: item.id,
      title: item.title,
      color: strapiColorToPalette(item.color),
    }));
  };

  const [tags, setTags] = useState<Tag[]>([]);
  const [notifications, setNotifications] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const init = async () => {
      const data = await fetchTags();

      setTags(data);

      const initialState = data.reduce(
        (acc, tag) => {
          acc[tag.id] = false;
          return acc;
        },
        {} as Record<number, boolean>,
      );

      setNotifications(initialState);
    };

    init();
  }, []);

  const toggle = (id: number) => {
    setNotifications((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleAll = () => {
    const allOn = Object.values(notifications).every(Boolean);
    const nextValue = !allOn;

    const updated = Object.keys(notifications).reduce(
      (acc, key) => {
        acc[Number(key)] = nextValue;
        return acc;
      },
      {} as Record<number, boolean>,
    );

    setNotifications(updated);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Pressable style={styles.toggleAllContainer} onPress={() => toggleAll()}>
        <TextCore variant="h3">SELECT ALL</TextCore>
        <SwitchCore
          onPress={() => toggleAll()}
          value={Object.values(notifications).every(Boolean)}
        />
      </Pressable>

      <View style={styles.horizontal_line}></View>
      {tags.map((tag) => (
        <Notification
          key={tag.id}
          text={tag.title}
          color={tag.color}
          value={notifications[tag.id]}
          onPress={() => toggle(tag.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  contentContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  toggleAllContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: "100%",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  horizontal_line: {
    borderBottomWidth: 1,
    borderStyle: "dashed",
    width: "100%",
  },
}));
