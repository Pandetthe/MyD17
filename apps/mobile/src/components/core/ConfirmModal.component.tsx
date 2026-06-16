import { Modal, Pressable, View } from "react-native";
import Button from "@/components/core/Button.component";
import { Card } from "@/components/core/Card.component";
import TextCore from "@/components/core/Text.component";
import { colors } from "@/styles/colors";
import type { ColorPalette, Theme } from "@/styles/themes/theme";
import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type Props = {
  visible: boolean;
  icon: LucideIcon;
  color?: ColorPalette;
  title: string;
  body?: string;
  onDismiss: () => void;
};

export default function ConfirmModal({
  visible,
  icon: Icon,
  color = "primary",
  title,
  body,
  onDismiss,
}: Props) {
  const { theme } = useUnistyles();
  const iconColor = color === "primary" || color === "dark"
    ? theme.colors.primary.main
    : colors[color as keyof typeof colors] && typeof colors[color as keyof typeof colors] === "object"
      ? (colors[color as keyof typeof colors] as { main: string }).main
      : theme.colors.primary.main;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable onPress={(e) => e.stopPropagation()} style={styles.wrapper}>
          <Card
            color={color}
            circle="hash"
            hashKey="confirm-modal"
            style={styles.cardOuter}
            contentStyle={styles.cardInner}
          >
            <Icon color={iconColor} size={32} />
            <TextCore variant="h2" style={styles.title}>
              {title}
            </TextCore>
            {body ? (
              <TextCore variant="body" color={theme.colors.primary.subtext} style={styles.body}>
                {body}
              </TextCore>
            ) : null}
            <View style={styles.buttons}>
              <Button text="OK" color={color} size="lg" onPress={onDismiss} />
            </View>
          </Card>
        </Pressable>
      </Pressable>
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
    alignItems: "stretch",
    width: "100%",
  },
}));
