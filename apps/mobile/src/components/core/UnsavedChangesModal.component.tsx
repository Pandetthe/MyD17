import { Modal, Pressable, View } from "react-native";
import { Card } from "@/components/core/Card.component";
import Button from "@/components/core/Button.component";
import TextCore from "@/components/core/Text.component";
import { colors } from "@/styles/colors";
import { Theme } from "@/styles/themes/theme";
import { useUnistyles } from "react-native-unistyles";
import { TriangleAlertIcon } from "lucide-react-native";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  visible: boolean;
  onKeep: () => void;
  onDiscard: () => void;
};

export default function UnsavedChangesModal({ visible, onKeep, onDiscard }: Props) {
  const { theme } = useUnistyles();

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onKeep}>
      <Pressable style={styles.backdrop} onPress={onKeep}>
        <Pressable onPress={(e) => e.stopPropagation()} style={styles.wrapper}>
          <Card color="amber" circle="hash" hashKey="unsaved-changes" style={styles.cardOuter} contentStyle={styles.cardInner}>
            <TriangleAlertIcon color={colors.amber.main} size={32} />
            <TextCore variant="h2" style={styles.title}>Niezapisane zmiany</TextCore>
            <TextCore variant="body" color={theme.colors.primary.subtext} style={styles.body}>
              Masz niezapisane preferencje powiadomień. Czy chcesz je odrzucić?
            </TextCore>
            <View style={styles.buttons}>
              <Button text="Odrzuć" color="red" size="lg" onPress={onDiscard} />
              <Button text="Kontynuuj edycję" color="amber" size="lg" hasBackground={false} onPress={onKeep} />
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
    flexDirection: "column",
    alignItems: "stretch",
    gap: theme.spacing.sm,
    width: "100%",
  },
}));
