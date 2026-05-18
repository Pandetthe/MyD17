import React, { useCallback, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { ContentRenderer } from "@/components/ContentRenderer";
import Button from "@/components/core/Button.component";
import TagComponent from "@/components/core/Tag.component";
import TextCore from "@/components/core/Text.component";
import { CalendarBottomSheet } from "@/components/posts/PostDetail/CalendarBottomSheet.component";
import { HeroImage } from "@/components/posts/PostDetail/HeroImage.component";
import {
  addEventToCalendar,
  extractCalendarEvents,
  type CalendarEvent,
} from "@/features/posts/hooks/useAddToCalendar";
import { getPostDescription, getPostHeroImage } from "@/features/posts/utils/postHelpers";
import { strapiUrl } from "@/lib/apiClient";
import { tagColor } from "@/lib/tagColor";
import { AvatarPlaceholder } from "@/lib/images";
import { colors } from "@/styles/colors";
import type { Theme } from "@/styles/themes/theme";
import type { Post, PostAuthor, Tag } from "@repo/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowLeft, CalendarPlus, Heart, Share2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "short",
  });
}

type Props = {
  post: Post;
};

export function PostDetail({ post }: Props) {
  const router = useRouter();
  const { theme } = useUnistyles();
  const isDark = theme.mode === "dark";
  const insets = useSafeAreaInsets();

  const heroUrl = getPostHeroImage(post);
  const description = getPostDescription(post);
  const content = post.content ?? [];
  const tags = (post.tags ?? []) as Tag[];
  const author = post.author as PostAuthor | undefined;
  const avatarUrl = author?.avatar?.url ? strapiUrl(author.avatar.url) : null;
  const dateLabel = post.createdAt ? formatDate(post.createdAt) : "";
  const hasHero = !!heroUrl;
  const hasContentBlocks = content.length > 0;
  const calendarEvents = extractCalendarEvents(post);

  const authorColor = isDark ? colors.white : colors.core.dark;
  const avatarBg = isDark ? colors.core.dark : colors.core.disabled;
  const subtextColor = isDark ? colors.core.extraLight : colors.core.muted;

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
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          !hasHero && { paddingTop: insets.top + theme.size.xl + theme.spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {hasHero && (
          <HeroImage imageUrl={heroUrl} onBack={() => router.back()} tags={tags} />
        )}

        <View style={styles.contentArea}>
          {/* Author row */}
          <View style={styles.authorRow}>
            <Image
              source={avatarUrl ? { uri: avatarUrl } : AvatarPlaceholder}
              style={[hasHero ? styles.avatarSmall : styles.avatarLarge, { backgroundColor: avatarBg }]}
              contentFit="cover"
            />
            <TextCore
              variant="label"
              color={authorColor}
              weight="bold"
              style={styles.authorName}
              numberOfLines={1}
            >
              {author?.username || "Autor"}
            </TextCore>
            <TextCore
              variant="label"
              color={colors.core.main}
              weight="bold"
              style={styles.date}
            >
              {dateLabel}
            </TextCore>
          </View>

          {/* Tags shown before title for text-only posts */}
          {!hasHero && tags.length > 0 && (
            <View style={styles.tagsRow}>
              {tags.map((tag) => (
                <TagComponent
                  key={tag.id}
                  text={`#${tag.title ?? ""}`}
                  color={tagColor(tag.color)}
                />
              ))}
            </View>
          )}

          <TextCore variant="h1" style={styles.title}>
            {post.title}
          </TextCore>

          {!hasContentBlocks && description.length > 0 && (
            <TextCore
              variant="body"
              color={subtextColor}
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
                <Share2 size={theme.size.md} color={colors.core.main} />
              </Pressable>
              <Pressable hitSlop={8}>
                <Heart size={theme.size.md} color={colors.core.main} />
              </Pressable>
              <TextCore variant="h3" color={colors.core.main} weight="bold">
                {post.likesCount}
              </TextCore>
            </View>
          </View>

          <ContentRenderer blocks={content} />
        </View>
      </ScrollView>

      {!hasHero && (
        <Button
          icon={ArrowLeft}
          color="dark"
          size="lg"
          style={[styles.backButton, { top: insets.top + theme.spacing.sm }]}
          onPress={() => router.back()}
        />
      )}

      <CalendarBottomSheet
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        calendarEvents={calendarEvents}
        onSelectDate={handleSelectDate}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    paddingBottom: theme.spacing.xl + theme.spacing.md,
  },
  contentArea: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.xs,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  avatarSmall: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.full,
    flexShrink: 0,
  },
  avatarLarge: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    flexShrink: 0,
  },
  authorName: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
  },
  date: {
    flexShrink: 0,
    fontSize: 14,
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xxs,
  },
  title: {
    textAlign: "center",
    lineHeight: 32,
    marginVertical: theme.spacing.xs,
  },
  justify: {
    textAlign: "justify",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  socials: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginLeft: "auto",
  },
  backButton: {
    position: "absolute",
    left: theme.spacing.md,
  },
}));
