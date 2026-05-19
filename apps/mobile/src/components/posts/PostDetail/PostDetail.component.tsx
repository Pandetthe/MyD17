import React, { useCallback } from "react";
import { View, Pressable, StatusBar } from "react-native";
import { ContentRenderer } from "@/components/ContentRenderer";
import Button from "@/components/core/Button.component";
import TagComponent from "@/components/core/Tag.component";
import TextCore from "@/components/core/Text.component";
import { HeroImage } from "@/components/posts/PostDetail/HeroImage.component";
import { addEventToCalendar, type CalendarEvent } from "@/features/posts/hooks/useAddToCalendar";
import { useLikePost } from "@/features/posts/api/useLikePost";
import { useSharePost } from "@/features/posts/hooks/useSharePost";
import { getPostDescription, getPostHeroImage } from "@/features/posts/utils/postHelpers";
import { tagColor } from "@/lib/tagColor";
import { colors } from "@/styles/colors";
import type { Theme } from "@/styles/themes/theme";
import type { Post, Tag } from "@repo/types";
import { useRouter } from "expo-router";
import { ArrowLeft, Heart, Share2 } from "lucide-react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

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
  const hasHero = !!heroUrl;
  const subtextColor = isDark ? colors.core.extraLight : colors.core.muted;

  const statusBarStyle = hasHero || isDark ? "light-content" : "dark-content";

  const handleAddToCalendar = useCallback(
    (event: CalendarEvent) => {
      void addEventToCalendar(post, event);
    },
    [post],
  );

  const goBack = useCallback(() => router.back(), [router]);

  const swipeBack = Gesture.Pan()
    .activeOffsetX([30, 9999])
    .failOffsetY([-15, 15])
    .onEnd((e) => {
      if (e.translationX > 80 || e.velocityX > 800) {
        runOnJS(goBack)();
      }
    });

  const handleShare = useSharePost(post);
  const { likePost, liked, likesCount } = useLikePost(post);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle={statusBarStyle} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          !hasHero && {
            paddingTop: insets.top + theme.size.xl + theme.spacing.xl + theme.spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {hasHero && <HeroImage imageUrl={heroUrl} tags={tags} />}

        <View style={styles.contentArea}>
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

          <View style={styles.body}>
            {description.length > 0 && (
              <TextCore variant="body" color={subtextColor} style={styles.justify}>
                {description}
              </TextCore>
            )}

            <View style={[styles.footer, description.length > 0 && styles.footerWithDescription]}>
              <Pressable style={styles.iconButton} hitSlop={8} onPress={handleShare}>
                <Share2 size={theme.size.md} color={colors.core.main} />
              </Pressable>
              <Pressable style={styles.iconButton} hitSlop={8} onPress={likePost}>
                <Heart
                  size={theme.size.md}
                  color={colors.core.main}
                  fill={liked ? colors.core.main : "transparent"}
                />
              </Pressable>
              <TextCore variant="h3" color={colors.core.main} weight="semiBold">
                {likesCount}
              </TextCore>
            </View>

            <ContentRenderer blocks={content} onAddToCalendar={handleAddToCalendar} />
          </View>
        </View>
      </ScrollView>

      <GestureDetector gesture={swipeBack}>
        <View style={styles.edgeTrigger} />
      </GestureDetector>

      <Button
        icon={ArrowLeft}
        color="dark"
        size="lg"
        style={[styles.backButton, { top: insets.top + theme.spacing.md }]}
        onPress={goBack}
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
    marginTop: -theme.spacing.lg,
  },
  body: {
    backgroundColor: theme.colors.surface,
    marginTop: theme.spacing.xs,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xxs,
    marginBottom: theme.spacing.md,
  },
  title: {
    textAlign: "center",
    lineHeight: 32,
  },
  justify: {
    textAlign: "justify",
    marginTop: theme.spacing.xs,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xxs,
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  footerWithDescription: {
    paddingTop: theme.spacing.md,
  },
  iconButton: {
    padding: theme.spacing.xxs,
  },
  backButton: {
    position: "absolute",
    left: theme.spacing.md,
  },
  edgeTrigger: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 24,
  },
}));
