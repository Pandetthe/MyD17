import { useMemo } from "react";
import { Text, View } from "react-native";
import { ColorPalette } from "@/styles/themes/theme";
import { useUnistyles } from "react-native-unistyles";

type TagProps = {
  text: string;
  color?: ColorPalette;
};

export default function Tag({ text, color = "primary" }: TagProps) {
  const { theme } = useUnistyles();

  const containerStyle = useMemo(
    () => ({
      height: theme.size.lg,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors[color].background.accent,
      borderColor: theme.colors[color].main,
      borderWidth: 1,
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
    </View>
  );
}
