import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import Button from "@/components/core/Button.component";
import { Card } from "@/components/core/Card.component";
import TextCore from "@/components/core/Text.component";
import { colors } from "@/styles/colors";
import type { ColorPalette, Theme } from "@/styles/themes/theme";
import type { LucideIcon } from "lucide-react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type Props = {
  visible: boolean;
  icon: LucideIcon;
  color?: ColorPalette;
  title: string;
  body?: string;
  onDismiss: () => void;
  action?: { label: string; onPress: () => void };
};

type Snapshot = {
  icon: LucideIcon;
  color: ColorPalette;
  title: string;
  body?: string;
  action?: { label: string; onPress: () => void };
};

export default function ConfirmModal({
  visible,
  icon,
  color = "primary",
  title,
  body,
  onDismiss,
  action,
}: Props) {
  const { theme } = useUnistyles();
  // internalVisible tracks if the Modal should be rendered at all.
  // It is true if visible is true, or if we are in the middle of a closing animation.
  const [internalVisible, setInternalVisible] = useState(visible);

  if (visible && !internalVisible) {
    setInternalVisible(true);
  }

  const snapRef = useRef<Snapshot>({ icon, color, title, body, action });
  if (visible) snapRef.current = { icon, color, title, body, action };
  const snap = snapRef.current;

  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
    } else if (internalVisible) {
      opacity.value = withTiming(
        0,
        { duration: 140, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setInternalVisible)(false);
        },
      );
    }
  }, [visible, internalVisible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const Icon = snap.icon;
  let iconColor: string;
  const paletteColor = colors[snap.color as keyof typeof colors];

  if (snap.color === "primary" || snap.color === "dark") {
    iconColor = theme.colors.primary.main;
  } else if (
    paletteColor &&
    typeof paletteColor === "object" &&
    paletteColor !== null &&
    "main" in paletteColor
  ) {
    iconColor = (paletteColor as { main: string }).main;
  } else {
    iconColor = theme.colors.primary.main;
  }

  return (
    <Modal transparent animationType="none" visible={internalVisible} onRequestClose={onDismiss}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={styles.backdropPressable} onPress={onDismiss} />
        <View style={styles.wrapper}>
          <Card
            color={snap.color}
            circle="hash"
            hashKey="confirm-modal"
            style={styles.cardOuter}
            contentStyle={styles.cardInner}
          >
            <Icon color={iconColor} size={32} />
            <TextCore variant="h2" style={styles.title}>
              {snap.title}
            </TextCore>
            {snap.body ? (
              <TextCore variant="body" color={theme.colors.primary.subtext} style={styles.body}>
                {snap.body}
              </TextCore>
            ) : null}
            <View style={styles.buttons}>
              {snap.action && (
                <Button
                  text={snap.action.label}
                  color={snap.color}
                  size="lg"
                  style={styles.buttonFlex}
                  onPress={() => {
                    snap.action!.onPress();
                    onDismiss();
                  }}
                />
              )}
              <Button
                text="OK"
                color={snap.color}
                size="lg"
                style={styles.buttonFlex}
                onPress={onDismiss}
              />
            </View>
          </Card>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  wrapper: {
    width: "100%",
  },
  cardOuter: {
    width: "100%",
  },
  cardInner: {
    padding: theme.spacing.lg,
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  title: {
    textAlign: "center",
  },
  body: {
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  buttons: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    width: "100%",
  },
  buttonFlex: {
    flex: 1,
  },
}));
