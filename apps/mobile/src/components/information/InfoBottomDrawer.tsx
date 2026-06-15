import React, { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, useWindowDimensions, View } from "react-native";
import { ContentRenderer } from "@/components/ContentRenderer";
import { colors } from "@/styles/colors";
import type { Theme } from "@/styles/themes/theme";
import type { PostContentBlock, StaticInformation } from "@repo/types";
import { LinearGradient } from "expo-linear-gradient";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();

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
  }, [screenHeight, finishClose]);

  useEffect(() => {
    if (!visible && !modalVisible) return;
    if (visible) open();
    else handleClose();
  }, [visible]);

  const makePan = () =>
    Gesture.Pan()
      .activeOffsetY(5)
      .failOffsetY(-5)
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

  const panGesture = makePan();

  // Track scroll position so the pan only steals gestures when at the top.
  const scrollY = useSharedValue(0);

  const scrollPan = Gesture.Pan()
    .onChange((e) => {
      const sheetMoving = translateY.value > 0;
      if (sheetMoving || (scrollY.value <= 0 && e.changeY > 0)) {
        translateY.value = Math.max(0, translateY.value + e.changeY);
      }
    })
    .onEnd((e) => {
      if (
        translateY.value > CLOSE_THRESHOLD ||
        (scrollY.value <= 0 && e.velocityY > CLOSE_VELOCITY * 1000)
      ) {
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(0, SPRING);
      }
    });

  // Simultaneous so the ScrollView can still scroll normally;
  // scrollPan only moves the sheet when already at scroll top.
  const scrollContentGesture = Gesture.Simultaneous(scrollPan, Gesture.Native());

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, screenHeight], [1, 0], Extrapolation.CLAMP),
  }));

  const scrollAnimatedProps = useAnimatedProps(() => ({
    scrollEnabled: translateY.value === 0,
  }));

  const blocks = (item?.content ?? []) as PostContentBlock[];

  return (
    <Modal transparent visible={modalVisible} animationType="none" onRequestClose={handleClose}>
      <GestureHandlerRootView style={styles.root}>
        <Animated.View testID="info-drawer-backdrop" style={[styles.backdrop, backdropStyle]}>
          <Pressable style={styles.backdropPressable} onPress={handleClose} />
        </Animated.View>

        <Animated.View testID="info-bottom-drawer" style={[styles.sheet, sheetStyle]}>
          <GestureDetector gesture={panGesture}>
            <View style={styles.handleArea}>
              <View testID="info-drawer-handle" style={styles.handle} />
            </View>
          </GestureDetector>

          <View style={styles.scrollArea}>
            <GestureDetector gesture={scrollContentGesture}>
              <Animated.ScrollView
                style={styles.scroll}
                contentContainerStyle={[
                  styles.content,
                  { paddingBottom: Math.max(48, insets.bottom + 32) },
                ]}
                showsVerticalScrollIndicator={false}
                onScroll={(e) => {
                  scrollY.value = e.nativeEvent.contentOffset.y;
                }}
                scrollEventThrottle={16}
                animatedProps={scrollAnimatedProps}
              >
                {blocks.length > 0 && (
                  <ContentRenderer
                    blocks={blocks}
                    textColor={colors.white}
                    dark
                    eventTitle={item?.title}
                  />
                )}
              </Animated.ScrollView>
            </GestureDetector>
            <LinearGradient
              colors={[colors.core.dark, colors.core.dark + "00"]}
              style={styles.scrollTopGradient}
              pointerEvents="none"
            />
          </View>
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
    backgroundColor: colors.core.dark,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: theme.spacing.md,
    shadowColor: colors.core.extraDark,
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
    opacity: 0.5,
  },
  scrollArea: {
    width: "100%",
  },
  scroll: {
    width: "100%",
  },
  scrollTopGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 30,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
}));
