import React, { useMemo } from "react";
import { Pressable, Text, StyleProp, ViewStyle } from "react-native";
import { colors, palette } from "@/styles/colors";
import { ColorPalette, PaletteColor } from "@/styles/themes/theme";
import { LucideIcon } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";

type ButtonSize = "sm" | "lg";

type ButtonProps = {
  text?: string;
  icon?: LucideIcon;
  color?: ColorPalette;
  size?: ButtonSize;
  hasBackground?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
} & React.ComponentProps<typeof Pressable>;

export default function Button({
  text = "",
  icon: IconComponent,
  size = "sm",
  color = "primary",
  hasBackground = true,
  onPress,
  style,
  accessibilityLabel,
  ...pressableProps
}: ButtonProps) {
  const { theme } = useUnistyles();
  const pressProgress = useSharedValue(0);

  const isRaw = color !== "primary" && color !== "dark" && color in palette;
  const tcKey = (color === "primary" || color === "dark") ? color : "primary";
  const main = isRaw
    ? palette[color as PaletteColor].main
    : theme.colors[tcKey].main;

  const selectedSize = useMemo(() => {
    const sizes = {
      sm: {
        height: theme.size.lg,
        icon: theme.size.sm,
        text: theme.size.xs,
        gap: theme.spacing.xs,
      },
      lg: {
        height: theme.size.xl,
        icon: theme.size.sm,
        text: theme.size.xs,
        gap: theme.spacing.sm,
      },
    };
    return sizes[size] ?? sizes.sm;
  }, [size, theme]);

  const fgColor = hasBackground
    ? (color === "dark" ? theme.colors.dark.text : colors.white)
    : main;
  const bgColor = hasBackground ? main : "transparent";

  const containerStyle = useMemo(
    () => ({
      height: selectedSize.height,
      ...(text ? {} : { aspectRatio: 1 }),
      borderRadius: theme.borderRadius.full,
      backgroundColor: bgColor,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      flexDirection: "row" as const,
      gap: selectedSize.gap,
      paddingHorizontal: selectedSize.gap,
    }),
    [bgColor, selectedSize, text, theme.borderRadius.full],
  );

  const textStyle = useMemo(
    () => ({
      color: fgColor,
      fontSize: selectedSize.text,
      paddingRight: theme.spacing.xxs,
      fontFamily: theme.fonts.semiBold,
    }),
    [fgColor, selectedSize.text, theme.fonts.semiBold],
  );

  const animatedStyle = useAnimatedStyle(() => {
    const scale = 1 - pressProgress.value * 0.05;
    const opacity = 1 - pressProgress.value * 0.4;
    return { transform: [{ scale }], opacity };
  });

  const resolvedA11yLabel = accessibilityLabel ?? (text ? text : "Button");

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        pressProgress.value = withTiming(1, { duration: 30, easing: Easing.out(Easing.quad) });
      }}
      onPressOut={() => {
        pressProgress.value = withTiming(0, { duration: 30, easing: Easing.out(Easing.quad) });
      }}
      accessibilityRole="button"
      accessibilityLabel={resolvedA11yLabel}
      hitSlop={8}
      style={style}
      {...pressableProps}
    >
      <Animated.View style={[containerStyle, animatedStyle]}>
        {IconComponent ? <IconComponent size={selectedSize.icon} color={fgColor} /> : null}
        {text ? <Text style={textStyle}>{text}</Text> : null}
      </Animated.View>
    </Pressable>
  );
}
