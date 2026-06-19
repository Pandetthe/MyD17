import { useEffect, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import Button from "@/components/core/Button.component";
import { Card } from "@/components/core/Card.component";
import TextCore from "@/components/core/Text.component";
import { colors } from "@/styles/colors";
import { Theme } from "@/styles/themes/theme";
import { TriangleAlertIcon } from "lucide-react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  visible: boolean;
  onKeep: () => void;
  onDiscard: () => void;
};

export default function UnsavedChangesModal({ visible, onKeep, onDiscard }: Props) {
  const { theme } = useUnistyles();
  const [modalVisible, setModalVisible] = useState(visible);

  if (visible && !modalVisible) {
    setModalVisible(true);
  }

  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
    } else if (modalVisible) {
      opacity.value = withTiming(
        0,
        { duration: 140, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setModalVisible)(false);
        },
      );
    }
  }, [visible, modalVisible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Modal transparent animationType="none" visible={modalVisible} onRequestClose={onKeep}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={styles.backdropPressable} onPress={onKeep} />
        <View style={styles.wrapper}>
          <Card
            color="amber"
            circle="hash"
            hashKey="unsaved-changes"
            style={styles.cardOuter}
            contentStyle={styles.cardInner}
          >
            <TriangleAlertIcon color={colors.amber.main} size={32} />
            <TextCore variant="h2" style={styles.title}>
              Niezapisane zmiany
            </TextCore>
            <TextCore variant="body" color={theme.colors.primary.subtext} style={styles.body}>
              Masz niezapisane preferencje powiadomień. Czy chcesz je odrzucić?
            </TextCore>
            <View style={styles.buttons}>
              <Button
                text="Odrzuć"
                color="red"
                size="lg"
                style={styles.buttonFlex}
                onPress={onDiscard}
              />
              <Button
                text="Kontynuuj edycję"
                color="amber"
                size="lg"
                style={styles.buttonFlex}
                onPress={onKeep}
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
