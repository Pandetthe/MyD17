import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Notification from "@/components/core/Notification.component";
import SwitchCore from "@/components/core/Switch.component";
import TextCore from "@/components/core/Text.component";
import { apiClient } from "@/lib/apiClient";
import { strapiColorToPalette } from "@/lib/strapiColors";
import type { Theme } from "@/styles/themes/theme";
import type { StrapiListResponse, Tag } from "@repo/types";
import { StyleSheet } from "react-native-unistyles";

export default function Notifications() {
  const fetchTags = async (): Promise<Tag[]> => {
    const res = await apiClient.get<StrapiListResponse<Tag>>("/api/tags");
    return res.data.data;
  };

  const [tags, setTags] = useState<Tag[]>([]);
  const [notifications, setNotifications] = useState<Record<string | number, boolean>>({});

  useEffect(() => {
    const init = async () => {
      try {
        const data = await fetchTags();
        setTags(data);

        const initialState = data.reduce(
          (acc, tag) => {
            if (tag.id !== undefined) {
              acc[tag.id] = false;
            }
            return acc;
          },
          {} as Record<string | number, boolean>,
        );

        setNotifications(initialState);
      } catch (error) {
        console.error("Failed to fetch tags for notifications:", error);
      }
    };

    init();
  }, []);

  const toggle = (id: string | number) => {
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
        acc[key] = nextValue;
        return acc;
      },
      {} as Record<string | number, boolean>,
    );

    setNotifications(updated);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Pressable style={styles.toggleAllContainer} onPress={() => toggleAll()}>
        <TextCore variant="h3">SELECT ALL</TextCore>
        <SwitchCore
          onPress={() => toggleAll()}
          value={
            Object.values(notifications).length > 0 && Object.values(notifications).every(Boolean)
          }
        />
      </Pressable>

      <View style={styles.horizontal_line} />
      {tags.map((tag) => (
        <Notification
          key={tag.id}
          text={tag.title}
          color={strapiColorToPalette(tag.color)}
          value={tag.id !== undefined ? notifications[tag.id] : false}
          onPress={() => tag.id !== undefined && toggle(tag.id)}
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
