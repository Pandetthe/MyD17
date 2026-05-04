import { Text, View } from "react-native";
import { ColorPalette } from "@/styles/themes/theme";
import { StyleSheet, useStyles } from "react-native-unistyles";

type TagProps = {
  text: string;
  color?: ColorPalette;
};

const stylesheet = StyleSheet.create((theme) => ({
  container: (color: ColorPalette) => ({
    height: theme.size.lg,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors[color].background.accent,
    borderColor: theme.colors[color].main,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.sm,
  }),
  text: (color: ColorPalette) => ({
    color: theme.colors[color].main,
    fontSize: theme.size.sm,
  }),
}));

export default function Tag({ text, color = "primary" }: TagProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={styles.container(color)}>
      <Text style={styles.text(color)}>{text}</Text>
    </View>
  );
}
