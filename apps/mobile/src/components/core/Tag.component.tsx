import { Text, View } from "react-native";
import { ColorPalette } from "@/styles/themes/theme";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type TagProps = {
  text: string;
  color?: ColorPalette;
};

export default function Tag({ text, color = "primary" }: TagProps) {
  const { theme } = useUnistyles();

  const styles = StyleSheet.create({
    container: {
      height: theme.size.lg,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors[color].background.accent,
      borderColor: theme.colors[color].main,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.sm,
    },
    text: {
      color: theme.colors[color].main,
      fontSize: theme.size.sm,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}