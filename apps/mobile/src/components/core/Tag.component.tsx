import { Text, Pressable } from "react-native";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { ColorPalette } from "@/styles/themes/theme";
import Animated from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

type TagProps = {
  text: string;
  color?: ColorPalette;
  selected?: boolean;
  onPress?: () => void;
};

export default function Tag({ text, color = "primary", selected = false, onPress }: TagProps) {
  const { animStyle, onPressIn, onPressOut } = usePressAnimation(0.95);

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[stylesheet.container(color, selected), animStyle]}>
        <Text style={stylesheet.text(color, selected)}>{text}</Text>
      </Animated.View>
    </Pressable>
  );
}

const stylesheet = StyleSheet.create((theme) => ({
  container: (color: ColorPalette, selected: boolean) => ({
    borderRadius: theme.borderRadius.full,
    backgroundColor: selected
      ? theme.mode === "dark"
        ? theme.colors[color].main
        : theme.colors[color].background.accent
      : theme.colors[color].background.main,
    borderColor: theme.colors[color].main,
    borderWidth: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    shadowColor: theme.colors[color].main,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 4,
  }),
  text: (color: ColorPalette, selected: boolean) => ({
    color: selected ? theme.colors[color].text.primary : theme.colors[color].text.secondary,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: theme.fonts.medium,
  }),
}));
