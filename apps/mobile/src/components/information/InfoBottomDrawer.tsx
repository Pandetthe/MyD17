import React, { useEffect, useRef } from "react";
import { Animated, Modal, PanResponder, Pressable, View } from "react-native";
import { colors } from "@/styles/colors";
import type { Theme } from "@/styles/themes/theme";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const CLOSE_THRESHOLD = 100;

export function InfoBottomDrawer({ visible, onClose }: Props) {
  const { theme } = useUnistyles();
  const translateY = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : 400,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 0,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) translateY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > CLOSE_THRESHOLD || vy > 0.5) {
          Animated.timing(translateY, {
            toValue: 600,
            duration: 200,
            useNativeDriver: true,
          }).start(onClose);
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.handleArea} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 200,
    backgroundColor: colors.core.extraDark,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    alignItems: "center",
    shadowColor: colors.core.dark,
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
    opacity: 0.4,
  },
}));
