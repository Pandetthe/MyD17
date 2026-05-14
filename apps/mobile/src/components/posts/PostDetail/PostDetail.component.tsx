import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import { ContentRenderer } from "@/components/ContentRenderer";
import Button from "@/components/core/Button.component";
import TagComponent from "@/components/core/Tag.component";
import TextCore from "@/components/core/Text.component";
import { HeroImage } from "@/components/posts/PostDetail/HeroImage.component";
import { getPostDescription, getPostHeroImage } from "@/features/posts/utils/postHelpers";
import { strapiUrl } from "@/lib/apiClient";
import { AvatarPlaceholder } from "@/lib/images";
import { strapiColorToPalette } from "@/lib/strapiColors";
import type { Theme } from "@/styles/themes/theme";
import type { Post, PostAuthor, Tag } from "@repo/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Heart, Share2, CalendarPlus } from "lucide-react-native";
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
  const heroUrl = getPostHeroImage(post);
  const description = getPostDescription(post);
  const content = post.content ?? [];
  const tags = (post.tags ?? []) as Tag[];
  const author = post.author as PostAuthor | undefined;
  const avatarUrl = author?.avatar?.url ? strapiUrl(author.avatar.url) : null;
  const dateLabel = post.createdAt ? formatDate(post.createdAt) : "";

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <HeroImage imageUrl={heroUrl} onBack={() => router.back()} tags={tags} />

      <View style={styles.contentArea}>
        {/* Author row */}
        <View style={styles.authorRow}>
          <Image
            source={avatarUrl ? { uri: avatarUrl } : AvatarPlaceholder}
            style={styles.avatar}
            contentFit="cover"
          />
          <TextCore variant="label" color={theme.colors.dark.main} weight="bold" style={styles.authorName} numberOfLines={1}>
            {author?.username ?? ""}
          </TextCore>
          <TextCore variant="label" color={theme.colors.primary.main} weight="bold" style={styles.date}>
            {dateLabel}
          </TextCore>
        </View>

        <TextCore variant="h1" style={styles.title}>
          {post.title}
        </TextCore>

        {tags.length > 0 && (
          <View style={styles.tagsRow}>
            {tags.map((tag) => (
              <TagComponent
                key={tag.id}
                text={`#${tag.title ?? ""}`}
                color={strapiColorToPalette(tag.color?.color)}
              />
            ))}
          </View>
        )}

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
          <Button icon={CalendarPlus} text="Add to Calendar" color="dark" size="sm" />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.dark.background.main,
  },
  content: {
    paddingBottom: theme.spacing.xl + theme.spacing.md,
  },
  contentArea: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.background.accent,
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
  title: {
    textAlign: "center",
    lineHeight: 32,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xxs,
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
  },
}));
