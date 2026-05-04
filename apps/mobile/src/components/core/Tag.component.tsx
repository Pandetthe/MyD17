import { useMemo } from "react";
import { Text, View } from "react-native";
import { ColorPalette } from "@/styles/themes/theme";
<<<<<<< HEAD
import { StyleSheet, useUnistyles } from "react-native-unistyles";
=======
import { useUnistyles } from "react-native-unistyles";
>>>>>>> parent of 2307731 (review changes)

type TagProps = {
  text: string;
  color?: ColorPalette;
};

export default function Tag({ text, color = "primary" }: TagProps) {
  const { theme } = useUnistyles();

<<<<<<< HEAD
  const styles = StyleSheet.create({
    container: {
=======
  const containerStyle = useMemo(
    () => ({
>>>>>>> parent of 2307731 (review changes)
      height: theme.size.lg,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors[color].background.accent,
      borderColor: theme.colors[color].main,
      borderWidth: 1,
<<<<<<< HEAD
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
=======
      alignItems: "center" as const,
      justifyContent: "center" as const,
      paddingHorizontal: theme.spacing.sm,
    }),
    [theme.colors[color], theme.borderRadius.full, theme.size.sm, theme.spacing.xs],
  );

  const textStyle = useMemo(
    () => ({
        color: theme.colors[color].main,
        fontSize: theme.size.sm,
    }),
    [theme.colors[color].main],
  )

  return (
    <View style={containerStyle}>
      <Text style={textStyle}>{text}</Text>
>>>>>>> parent of 2307731 (review changes)
    </View>
  );
}