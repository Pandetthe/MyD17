import React from "react";
import { View, Pressable } from "react-native";
import { Card } from "@/components/core/Card.component";
import TagComponent from "@/components/core/Tag.component";
import TextCore from "@/components/core/Text.component";
import { getPostDescription, getPostFirstImage } from "@/features/posts/utils/postHelpers";
import { strapiUrl } from "@/lib/apiClient";
import { AvatarPlaceholder } from "@/lib/images";
import { tagColor } from "@/lib/tagColor";
import { colors } from "@/styles/colors";
import type { Theme } from "@/styles/themes/theme";
import MaskedView from "@react-native-masked-view/masked-view";
import type { Post, PostAuthor, Tag } from "@repo/types";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, Share2 } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

// Mask: fully opaque top → transparent bottom so card background & circle show through
const IMAGE_MASK_COLORS = ["black", "black", "transparent"] as const;
const IMAGE_MASK_LOCATIONS = [0, 0.75, 1] as const;

type Props = {
  post: Post;
  onPress: () => void;
  onTagPress?: (id: number | string) => void;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "short",
  });
}

export function PostCard({ post, onPress, onTagPress }: Props) {
  const { theme } = useUnistyles();
  const isDark = theme.mode === "dark";

  const imageUrl = getPostFirstImage(post);
  const description = getPostDescription(post);
  const dateLabel = post.createdAt ? formatDate(post.createdAt) : "";
  const author = post.author as PostAuthor | undefined;
  const avatarUrl = author?.avatar?.url ? strapiUrl(author.avatar.url) : null;
  const tags = (post.tags ?? []) as Tag[];

  const hasImage = !!imageUrl;

  const authorColor = isDark ? colors.white : colors.core.dark;
  const avatarBg = isDark ? colors.core.dark : colors.core.disabled;
  const subtextColor = isDark ? colors.core.extraLight : colors.core.muted;

  return (
    <Card
      color="primary"
      gradient={theme.colors.gradients.posts}
      circle="hash"
      hashKey={post.documentId ?? post.title ?? ""}
      onPress={onPress}
      style={styles.wrapper}
      contentStyle={styles.cardShell}
    >
      {/* ── Author row ── */}
      <View style={styles.authorRow}>
        <Image
          source={avatarUrl ? { uri: avatarUrl } : AvatarPlaceholder}
          style={[styles.avatar, { backgroundColor: avatarBg }]}
          contentFit="cover"
        />
        <TextCore variant="label" color={authorColor} numberOfLines={1} style={styles.authorName}>
          {author?.username || "Autor"}
        </TextCore>
        <TextCore variant="label" color={colors.core.main} style={styles.date}>
          {dateLabel}
        </TextCore>
      </View>

      {/* ── Hero image (image posts only) ── */}
      {hasImage && (
        <View style={styles.imageContainer}>
          <MaskedView
            style={styles.maskedArea}
            maskElement={
              <LinearGradient
                colors={IMAGE_MASK_COLORS}
                locations={IMAGE_MASK_LOCATIONS}
                style={styles.maskedArea}
              />
            }
          >
            <Image source={{ uri: imageUrl! }} style={styles.image} contentFit="cover" />
          </MaskedView>
          {tags.length > 0 && (
            <View style={styles.tagsOverlay}>
              {tags.map((tag) => (
                <TagComponent
                  key={tag.id}
                  text={`#${tag.title ?? ""}`}
                  color={tagColor(tag.color)}
                  onPress={tag.id != null ? () => onTagPress?.(tag.id!) : undefined}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* ── Tags row (text-only posts, above title) ── */}
      {!hasImage && tags.length > 0 && (
        <View style={styles.tagsRow}>
          {tags.map((tag) => (
            <TagComponent
              key={tag.id}
              text={`#${tag.title ?? ""}`}
              color={tagColor(tag.color)}
              onPress={tag.id != null ? () => onTagPress?.(tag.id!) : undefined}
            />
          ))}
        </View>
      )}

      {/* ── Title ── */}
      <TextCore variant="h2" numberOfLines={2} style={styles.title}>
        {post.title}
      </TextCore>

      {/* ── Description ── */}
      {description.length > 0 && (
        <TextCore variant="body" color={subtextColor} numberOfLines={3} style={styles.description}>
          {description}
        </TextCore>
      )}

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <Pressable style={styles.iconButton} hitSlop={8}>
          <Share2 size={theme.size.md} color={colors.core.main} />
        </Pressable>
        <Pressable style={styles.iconButton} hitSlop={8}>
          <Heart size={theme.size.md} color={colors.core.main} />
        </Pressable>
        <TextCore variant="h3" color={colors.core.main} weight="semiBold">
          {post.likesCount}
        </TextCore>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  wrapper: {
    alignSelf: "stretch",
  },
  cardShell: {},
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  avatar: {
    width: 24,
    height: 24,
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
  imageContainer: {
    height: 250,
  },
  maskedArea: {
    width: "100%",
    height: 250,
  },
  image: {
    width: "100%",
    height: 250,
  },
  tagsOverlay: {
    position: "absolute",
    bottom: theme.spacing.sm,
    left: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xxs,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xxs,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xxs,
  },
  title: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xxs,
    paddingBottom: theme.spacing.xs - 2,
  },
  description: {
    textAlign: "justify",
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    paddingTop: theme.spacing.xxs,
  },
  iconButton: {
    padding: theme.spacing.xxs,
  },
}));
