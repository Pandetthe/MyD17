import React, { useCallback, useEffect } from "react";
import { Modal, Pressable, TouchableOpacity, View, useWindowDimensions } from "react-native";
import TextCore from "@/components/core/Text.component";
import type { CalendarEvent } from "@/features/posts/hooks/useAddToCalendar";
import { colors } from "@/styles/colors";
import type { Theme } from "@/styles/themes/theme";
import { CalendarPlus } from "lucide-react-native";
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
  visible: boolean;
  onClose: () => void;
  calendarEvents: CalendarEvent[];
  onSelectDate: (event: CalendarEvent) => void;
};

const CLOSE_THRESHOLD = 100;
const SPRING = { stiffness: 1000, damping: 500, mass: 3, overshootClamping: true } as const;
const CLOSE_TIMING = { duration: 300, easing: Easing.in(Easing.ease) } as const;

export function CalendarBottomSheet({ visible, onClose, calendarEvents, onSelectDate }: Props) {
  const { theme } = useUnistyles();
  const { height: screenHeight } = useWindowDimensions();
  const translateY = useSharedValue(screenHeight);

  const finishClose = useCallback(() => onClose(), [onClose]);

  const handleClose = useCallback(() => {
    translateY.value = withTiming(screenHeight, CLOSE_TIMING, (finished) => {
      if (finished) runOnJS(finishClose)();
    });
  }, [screenHeight, finishClose, translateY]);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, SPRING);
    } else {
      translateY.value = screenHeight;
    }
  }, [visible, screenHeight, translateY]);

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

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
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
              onPress={() => onSelectDate(event)}
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
