import React from "react";
import { View, Pressable } from "react-native";
import TagComponent from "@/components/core/Tag.component";
import TextCore from "@/components/core/Text.component";
import { getPostDescription, getPostFirstImage } from "@/features/posts/utils/postHelpers";
import { PostPlaceholder } from "@/lib/images";
import type { Theme } from "@/styles/themes/theme";
import type { ColorPalette } from "@/styles/themes/theme";
import type { Post } from "../types/post.types";
import { getPostDescription, getPostFirstImage } from "../utils/postHelpers";
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

function mapTagColor(colorName?: string): ColorPalette {
  const map: Record<string, ColorPalette> = {
    red: "red",
    rose: "red",
    amber: "amber",
    yellow: "amber",
    orange: "amber",
    green: "green",
    emerald: "green",
    lime: "green",
    teal: "teal",
    cyan: "teal",
    blue: "primary",
    sky: "primary",
    indigo: "purple",
    violet: "purple",
    purple: "purple",
    fuchsia: "pink",
    pink: "pink",
  };
  return map[colorName ?? ""] ?? "primary";
}

export function PostCard({ post, onPress, onTagPress }: Props) {
  const { theme } = useUnistyles();
  const imageUrl = getPostFirstImage(post);
  const description = getPostDescription(post);
  const dateLabel = post.createdAt ? formatDate(post.createdAt) : "";

  return (
    <Pressable onPress={onPress} style={styles.wrapper}>
      <LinearGradient
        colors={["#F2F9FF", "#ECF6FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Author row */}
        <View style={styles.authorRow}>
          <View style={styles.avatar} />
          <TextCore
            variant="label"
            color={theme.colors.dark.main}
            numberOfLines={1}
            style={styles.authorName}
          >
            {post.title}
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
              {(post.tags ?? []).map((tag) => (
                <TagComponent
                  key={tag.id}
                  text={`#${tag.title}`}
                  color={mapTagColor(tag.color?.color)}
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
    </Pressable>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  wrapper: {
    width: "100%",
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    shadowColor: theme.colors.primary.main,
    shadowOffset: { width: 10, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
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
