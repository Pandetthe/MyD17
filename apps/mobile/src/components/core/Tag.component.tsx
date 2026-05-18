import { Text, Pressable } from "react-native";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { palette } from "@/styles/colors";
import { ColorPalette, PaletteColor } from "@/styles/themes/theme";
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
  container: (color: ColorPalette, selected: boolean) => {
    const isDark = theme.mode === "dark";
    const isRaw = color != null && color !== "primary" && color !== "dark" && color in palette;
    const tcKey = (color === "primary" || color === "dark") ? color : "primary";
    const c = isRaw ? palette[color as PaletteColor] : null;
    const tc = !isRaw ? (theme.colors[tcKey] ?? theme.colors.primary) : null;
    const main = c ? c.main : tc!.main;

    let bg: string;
    if (selected) {
      bg = isDark ? main : (c ? c.light : tc!.bgAccent);
    } else {
      bg = c ? (isDark ? c.extraDark : c.extraLight) : theme.colors.surface;
    }

    return {
      borderRadius: theme.borderRadius.full,
      backgroundColor: bg,
      borderColor: main,
      borderWidth: 1,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      shadowColor: main,
      shadowOffset: { width: 5, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 4,
    };
  },
  text: (color: ColorPalette, selected: boolean) => {
    const isDark = theme.mode === "dark";
    const isRaw = color != null && color !== "primary" && color !== "dark" && color in palette;
    const tcKey = (color === "primary" || color === "dark") ? color : "primary";
    const c = isRaw ? palette[color as PaletteColor] : null;
    const tc = !isRaw ? (theme.colors[tcKey] ?? theme.colors.primary) : null;

    const textColor = selected
      ? c ? (isDark ? c.extraLight : c.extraDark) : tc!.text
      : c ? (isDark ? c.light : c.dark) : tc!.subtext;

    return {
      color: textColor,
      fontSize: 14,
      lineHeight: 18,
      fontFamily: theme.fonts.medium,
    };
  },
}));
