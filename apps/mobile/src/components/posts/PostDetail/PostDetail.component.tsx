import React, { useCallback, useEffect, useState } from "react";
import { View, ScrollView, Pressable, Modal, TouchableOpacity, useWindowDimensions } from "react-native";
import { ContentRenderer } from "@/components/ContentRenderer";
import Button from "@/components/core/Button.component";
import TextCore from "@/components/core/Text.component";
import { HeroImage } from "@/components/posts/PostDetail/HeroImage.component";
import {
  addEventToCalendar,
  extractCalendarEvents,
  type CalendarEvent,
} from "@/features/posts/hooks/useAddToCalendar";
import { getPostDescription, getPostHeroImage } from "@/features/posts/utils/postHelpers";
import { colors } from "@/styles/colors";
import type { Theme } from "@/styles/themes/theme";
import type { Post, Tag } from "@repo/types";
import { useRouter } from "expo-router";
import { Heart, Share2, CalendarPlus } from "lucide-react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type Props = {
  post: Post;
};

const CLOSE_THRESHOLD = 100;
const SPRING = { stiffness: 1000, damping: 500, mass: 3, overshootClamping: true } as const;
const CLOSE_TIMING = { duration: 300, easing: Easing.in(Easing.ease) } as const;


export function PostDetail({ post }: Props) {
  const router = useRouter();
  const { theme } = useUnistyles();
  const { height: screenHeight } = useWindowDimensions();
  const heroUrl = getPostHeroImage(post);
  const description = getPostDescription(post);
  const content = post.content ?? [];
  const tags = post.tags ?? [];
  const calendarEvents = extractCalendarEvents(post);

  const translateY = useSharedValue(screenHeight);
  const [modalVisible, setModalVisible] = useState(false);

  const finishClose = useCallback(() => setModalVisible(false), []);

  const handleClose = useCallback(() => {
    translateY.value = withTiming(screenHeight, CLOSE_TIMING, (finished) => {
      if (finished) runOnJS(finishClose)();
    });
  }, [screenHeight, finishClose, translateY]);

  const openSheet = () => {
    setModalVisible(true);
    translateY.value = withSpring(0, SPRING);
  };

  useEffect(() => {
    if (!modalVisible) translateY.value = screenHeight;
  }, [modalVisible, screenHeight, translateY]);

  const panGesture = Gesture.Pan()
    .activeOffsetY(5)
    .onChange((e) => {
      if (e.translationY > 0) translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > CLOSE_THRESHOLD || e.velocityY > 500) {
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(0, SPRING);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, screenHeight], [1, 0], Extrapolation.CLAMP),
  }));

  const handleAddToCalendar = () => {
    if (calendarEvents.length === 0) return;
    if (calendarEvents.length === 1) {
      void addEventToCalendar(post, calendarEvents[0]!);
    } else {
      openSheet();
    }
  };

  const handleSelectDate = (event: CalendarEvent) => {
    handleClose();
    void addEventToCalendar(post, event);
  };


  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
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

      <Modal transparent visible={modalVisible} animationType="none" onRequestClose={handleClose}>
        <GestureHandlerRootView style={styles.root}>
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            <Pressable style={styles.backdropPressable} onPress={handleClose} />
          </Animated.View>

          <Animated.View style={[styles.sheet, sheetStyle]}>
            <GestureDetector gesture={panGesture}>
              <View style={styles.handleArea}>
                <View style={styles.handle} />
              </View>
            </GestureDetector>

            <TextCore variant="h2" weight="bold" color={colors.white} style={styles.sheetTitle}>
              Wybierz termin
            </TextCore>

            {calendarEvents.map((event, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dateOption}
                onPress={() => handleSelectDate(event)}
                activeOpacity={0.7}
              >
                <CalendarPlus size={theme.size.sm} color={colors.white} />
                <TextCore variant="body" color={colors.white} style={styles.dateOptionText}>
                  {event.label}
                </TextCore>
              </TouchableOpacity>
            ))}

            <View style={styles.bottomPadding} />
          </Animated.View>
        </GestureHandlerRootView>
      </Modal>
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
  },
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  backdropPressable: {
    flex: 1,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.dark.background.accent,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: theme.spacing.md,
    shadowColor: theme.colors.dark.main,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 1,
    shadowRadius: 80,
    elevation: 20,
  },
  handleArea: {
    width: "100%",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  handle: {
    width: 64,
    height: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: colors.white,
  },
  sheetTitle: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  dateOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  dateOptionText: {
    flex: 1,
  },
  bottomPadding: {
    height: theme.spacing.xl,
  },
}));
