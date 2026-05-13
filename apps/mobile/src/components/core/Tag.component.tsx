import { Pressable, Text } from "react-native";
import { ColorPalette } from "@/styles/themes/theme";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

type TagProps = {
  text: string;
  color?: ColorPalette;
  selected?: boolean;
  onPress?: () => void;
};

export default function Tag({ text, color = "primary", selected = false, onPress }: TagProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withTiming(0.92, { duration: 60 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 100 }); }}
      disabled={!onPress}
    >
      <Animated.View style={[stylesheet.container(color, selected), animatedStyle]}>
        <Text style={stylesheet.text(color, selected)}>{text}</Text>
      </Animated.View>
    </Pressable>
  );
}

const stylesheet = StyleSheet.create((theme) => ({
  container: (color: ColorPalette, selected: boolean) => ({
    height: theme.size.lg,
    borderRadius: theme.borderRadius.full,
    backgroundColor: selected ? theme.colors[color].main : theme.colors[color].background.accent,
    borderColor: theme.colors[color].main,
    borderWidth: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: theme.spacing.sm,
  }),
  text: (color: ColorPalette, selected: boolean) => ({
    color: selected ? theme.colors[color].background.accent : theme.colors[color].main,
    fontSize: theme.size.sm,
    fontFamily: theme.fonts.medium,
  }),
}));
