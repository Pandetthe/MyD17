import { Modal, Pressable, View } from "react-native";
import Button from "@/components/core/Button.component";
import TextCore from "@/components/core/Text.component";
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
        <Pressable style={styles.card}>
          <TriangleAlertIcon color={theme.colors.amber.main} size={36} />
          <TextCore variant="h2" style={styles.title}>Unsaved changes</TextCore>
          <TextCore variant="body" style={styles.body}>
            You have unsaved notification preferences. Discard them?
          </TextCore>
          <View style={styles.buttons}>
            <Button text="Discard" color="red" size="lg" onPress={onDiscard} />
            <Button text="Keep editing" color="dark" size="lg" hasBackground={false} onPress={onKeep} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  card: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  title: {
    textAlign: "center",
  },
  body: {
    textAlign: "center",
    opacity: 0.6,
    marginBottom: theme.spacing.xs,
  },
  buttons: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: theme.spacing.sm,
    width: "100%",
  },
}));
