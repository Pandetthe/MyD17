import React, { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, useWindowDimensions, View } from "react-native";
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
import { ContentRenderer } from "@/components/ContentRenderer";
import { colors } from "@/styles/colors";
import type { Theme } from "@/styles/themes/theme";
import type { PostContentBlock, StaticInformation } from "@repo/types";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  visible: boolean;
  item: StaticInformation | null;
  onClose: () => void;
};

const CLOSE_THRESHOLD = 100;
const CLOSE_VELOCITY = 0.5;
const SPRING = { stiffness: 1000, damping: 500, mass: 3, overshootClamping: true } as const;
const CLOSE_TIMING = { duration: 300, easing: Easing.in(Easing.ease) } as const;

export function InfoBottomDrawer({ visible, item, onClose }: Props) {
  const { height: screenHeight } = useWindowDimensions();

  const translateY = useSharedValue(screenHeight);
  const [modalVisible, setModalVisible] = useState(false);

  const open = () => {
    setModalVisible(true);
    translateY.value = withSpring(0, SPRING);
  };

  const finishClose = useCallback(() => {
    setModalVisible(false);
    onClose();
  }, [onClose]);

  const handleClose = useCallback(() => {
    translateY.value = withTiming(screenHeight, CLOSE_TIMING, (finished) => {
      if (finished) runOnJS(finishClose)();
    });
  }, [screenHeight, finishClose]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!visible && !modalVisible) return;
    if (visible) open();
    else handleClose();
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const panGesture = Gesture.Pan()
    .activeOffsetY(5)
    .onChange((e) => {
      if (e.translationY > 0) translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > CLOSE_THRESHOLD || e.velocityY > CLOSE_VELOCITY * 1000) {
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

  const blocks = (item?.content ?? []) as PostContentBlock[];

  return (
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

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {blocks.length > 0 && <ContentRenderer blocks={blocks} textColor={colors.white} dark />}
          </ScrollView>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
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
    maxHeight: "80%",
    backgroundColor: theme.colors.dark.text.secondary,
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
  scroll: {
    width: "100%",
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
}));
