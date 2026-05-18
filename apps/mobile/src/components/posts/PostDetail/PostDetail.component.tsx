import React, { useCallback, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { ContentRenderer } from "@/components/ContentRenderer";
import Button from "@/components/core/Button.component";
import TextCore from "@/components/core/Text.component";
import { CalendarBottomSheet } from "@/components/posts/PostDetail/CalendarBottomSheet.component";
import { HeroImage } from "@/components/posts/PostDetail/HeroImage.component";
import {
  addEventToCalendar,
  extractCalendarEvents,
  type CalendarEvent,
} from "@/features/posts/hooks/useAddToCalendar";
import { getPostDescription, getPostHeroImage } from "@/features/posts/utils/postHelpers";
import type { Theme } from "@/styles/themes/theme";
import type { Post, Tag } from "@repo/types";
import { useRouter } from "expo-router";
import { Heart, Share2, CalendarPlus } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type Props = {
  post: Post;
};

export function PostDetail({ post }: Props) {
  const router = useRouter();
  const { theme } = useUnistyles();
  const heroUrl = getPostHeroImage(post);
  const description = getPostDescription(post);
  const content = post.content ?? [];
  const tags = post.tags ?? [];
  const calendarEvents = extractCalendarEvents(post);

  const [modalVisible, setModalVisible] = useState(false);

  const handleAddToCalendar = () => {
    if (calendarEvents.length === 0) return;
    if (calendarEvents.length === 1) {
      void addEventToCalendar(post, calendarEvents[0]!);
    } else {
      setModalVisible(true);
    }
  };

  const handleSelectDate = useCallback(
    (event: CalendarEvent) => {
      setModalVisible(false);
      void addEventToCalendar(post, event);
    },
    [post],
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      alwaysBounceVertical={false}
    >
      <HeroImage imageUrl={heroUrl} onBack={() => router.back()} tags={tags as Tag[]} />

      <View style={styles.contentArea}>
        <TextCore variant="h1" style={styles.title}>
          {post.title}
        </TextCore>

        {description.length > 0 && (
          <TextCore
            variant="body"
            color={theme.colors.primary.text.secondary}
            style={styles.justify}
          >
            {description}
          </TextCore>
        )}

        <View style={styles.actionRow}>
          {calendarEvents.length > 0 && (
            <Button
              icon={CalendarPlus}
              text="Dodaj do kalendarza"
              color="dark"
              size="md"
              onPress={handleAddToCalendar}
            />
          )}
          <View style={styles.socials}>
            <Pressable hitSlop={8}>
              <Share2 size={theme.size.md} color={theme.colors.primary.main} />
            </Pressable>
            <Pressable hitSlop={8}>
              <Heart size={theme.size.md} color={theme.colors.primary.main} />
            </Pressable>
            <TextCore variant="h3" color={theme.colors.primary.main} weight="bold">
              {post.likesCount}
            </TextCore>
          </View>
        </View>

        <ContentRenderer blocks={content} />
      </View>

      <CalendarBottomSheet
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        calendarEvents={calendarEvents}
        onSelectDate={handleSelectDate}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    paddingBottom: theme.spacing.xl + theme.spacing.md,
  },
  contentArea: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  title: {
    textAlign: "center",
    lineHeight: 32,
  },
  justify: {
    textAlign: "justify",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  socials: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginLeft: "auto",
  },
}));
