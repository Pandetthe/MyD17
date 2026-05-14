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
import { ArrowLeft, Heart, Share2 } from "lucide-react-native";
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
  const insets = useSafeAreaInsets();
  const heroUrl = getPostHeroImage(post);
  const description = getPostDescription(post);
  const content = post.content ?? [];
  const tags = (post.tags ?? []) as Tag[];
  const author = post.author as PostAuthor | undefined;
  const avatarUrl = author?.avatar?.url ? strapiUrl(author.avatar.url) : null;
  const dateLabel = post.createdAt ? formatDate(post.createdAt) : "";
  const hasHero = !!heroUrl;

  // Only show description if no rich content blocks (avoid duplication)
  const hasContentBlocks = content.length > 0;

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
              style={hasHero ? styles.avatarSmall : styles.avatarLarge}
              contentFit="cover"
            />
            <TextCore
              variant="label"
              color={theme.colors.dark.main}
              weight="bold"
              style={styles.authorName}
              numberOfLines={1}
            >
              {author?.username || "Autor"}
            </TextCore>
            <TextCore
              variant="label"
              color={theme.colors.primary.main}
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
                  color={strapiColorToPalette(tag.color?.color)}
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
              color={theme.colors.primary.text.secondary}
              style={styles.justify}
            >
              {description}
            </TextCore>
          )}

          <View style={styles.actionRow}>
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

      {!hasHero && (
        <Button
          icon={ArrowLeft}
          color="dark"
          size="lg"
          style={[styles.backButton, { top: insets.top + theme.spacing.sm }]}
          onPress={() => router.back()}
        />
      )}
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
    backgroundColor: theme.colors.primary.background.accent,
    flexShrink: 0,
  },
  avatarLarge: {
    width: 40,
    height: 40,
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
  },
  backButton: {
    position: "absolute",
    left: theme.spacing.md,
  },
}));
