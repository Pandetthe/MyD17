import React from "react";
import { View, Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import TagComponent from "@/components/core/Tag.component";
import TextCore from "@/components/core/Text.component";
import { getPostDescription, getPostFirstImage } from "@/features/posts/utils/postHelpers";
import { strapiUrl } from "@/lib/apiClient";
import { PostPlaceholder } from "@/lib/images";
import { strapiColorToPalette } from "@/lib/strapiColors";
import type { Theme } from "@/styles/themes/theme";
import type { Post, PostAuthor, Tag } from "@repo/types";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, Share2 } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

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
  const imageUrl = getPostFirstImage(post);
  const description = getPostDescription(post);
  const dateLabel = post.createdAt ? formatDate(post.createdAt) : "";
  const author = post.author as PostAuthor | undefined;
  const avatarUrl = author?.avatar?.url ? strapiUrl(author.avatar.url) : null;
  const { animStyle, onPressIn, onPressOut } = usePressAnimation(0.97);

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.wrapper, animStyle]}>
      <LinearGradient
        colors={["#F2F9FF", "#ECF6FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Author row */}
        <View style={styles.authorRow}>
          <Image
            source={avatarUrl ? { uri: avatarUrl } : null}
            style={styles.avatar}
            contentFit="cover"
          />
          <TextCore
            variant="label"
            color={theme.colors.dark.main}
            numberOfLines={1}
            style={styles.authorName}
          >
            {author?.username ?? ""}
          </TextCore>
          <TextCore variant="label" color={theme.colors.primary.main} style={styles.date}>
            {dateLabel}
          </TextCore>
        </View>

        {/* Image + tags overlay */}
        <View style={styles.imageContainer}>
          <Image
            source={imageUrl ? { uri: imageUrl } : PostPlaceholder}
            style={styles.image}
            contentFit="cover"
          />

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.55)"]}
            locations={[0.538, 1]}
            style={styles.imageDarkOverlay}
            pointerEvents="none"
          />

          <LinearGradient
            colors={["rgba(236,246,255,0)", "#ecf6ff"]}
            style={styles.imageGradient}
            pointerEvents="none"
          />

          {(post.tags ?? []).length > 0 && (
            <View style={styles.tagsOverlay}>
              {((post.tags ?? []) as Tag[]).map((tag) => (
                <TagComponent
                  key={tag.id}
                  text={`#${tag.title ?? ""}`}
                  color={strapiColorToPalette(tag.color?.color)}
                  onPress={tag.id != null ? () => onTagPress?.(tag.id!) : undefined}
                />
              ))}
            </View>
          )}
        </View>

        {/* Decorative ellipse */}
        <View style={styles.decorEllipse} />

        {/* Title */}
        <TextCore variant="h2" numberOfLines={2} style={styles.title}>
          {post.title}
        </TextCore>

        {/* Description */}
        {description.length > 0 && (
          <TextCore
            variant="body"
            color={theme.colors.primary.text.secondary}
            numberOfLines={3}
            style={styles.description}
          >
            {description}
          </TextCore>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable style={styles.iconButton} hitSlop={8}>
            <Share2 size={theme.size.md} color={theme.colors.primary.main} />
          </Pressable>
          <Pressable style={styles.iconButton} hitSlop={8}>
            <Heart size={theme.size.md} color={theme.colors.primary.main} />
          </Pressable>
          <TextCore variant="h3" color={theme.colors.primary.main} weight="bold">
            {post.likesCount}
          </TextCore>
        </View>
      </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  wrapper: {
    alignSelf: "stretch",
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    shadowColor: theme.colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  card: {
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  avatar: {
    width: theme.size.lg - 8,
    height: theme.size.lg - 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.background.accent,
    flexShrink: 0,
  },
  authorName: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  date: {
    flexShrink: 0,
    fontSize: 13,
    lineHeight: 18,
  },
  imageContainer: {
    height: 250,
    position: "relative",
  },
  image: {
    width: "100%",
    height: 250,
  },
  imageDarkOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 116,
  },
  decorEllipse: {
    position: "absolute",
    left: -39,
    top: 300,
    width: 267,
    height: 267,
    borderRadius: 133.5,
    backgroundColor: theme.colors.primary.background.accent,
    opacity: 0.3,
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
  title: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
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
