import React, { useMemo } from "react";
import { Pressable, Text, StyleProp, ViewStyle } from "react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { LucideIcon } from "lucide-react-native";
import { useUnistyles } from "react-native-unistyles";
import { ColorPalette } from "@/styles/themes/theme";

interface ButtonProps {
  text?: string;
  icon?: LucideIcon;
  color?: ColorPalette;
  size?: "sm" | "lg";
  hasBackground?: boolean;
  onPress?: () => void;

  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export default function Button({
  text = "",
  icon: IconComponent,
  size = "sm",
  color = "primary",
  hasBackground = true,
  onPress,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const { theme } = useUnistyles();
  const pressProgress = useSharedValue(0);

  const selectedSize = useMemo(
    () =>
      ({
        sm: {
          height: theme.size.lg,
          icon: theme.size.sm,
          text: theme.size.xs,
          gap: theme.spacing.xs,
        },
        lg: {
          height: theme.size.xl,
          icon: theme.size.md,
          text: theme.size.sm,
          gap: theme.spacing.sm,
        },
      })[size],
    [size, theme],
  );

  const fgColor = hasBackground
    ? theme.colors[color].background.accent
    : theme.colors[color].main;

  const bgColor = hasBackground ? theme.colors[color].main : "transparent";

  const containerStyle = useMemo(
    () => ({
      height: selectedSize.height,
      borderRadius: theme.borderRadius.full,
      backgroundColor: bgColor,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      flexDirection: "row" as const,
      gap: selectedSize.gap,
      paddingHorizontal: selectedSize.gap,
    }),
    [bgColor, selectedSize, theme.borderRadius.full],
  );

  const textStyle = useMemo(
    () => ({
      color: fgColor,
      fontSize: selectedSize.text,
      paddingRight: theme.spacing.xxs,
    }),
    [fgColor, selectedSize.text],
  );

  const animatedStyle = useAnimatedStyle(() => {
    const scale = 1 - pressProgress.value * 0.05;
    const opacity = 1 - pressProgress.value * 0.4;

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const resolvedA11yLabel = accessibilityLabel ?? (text ? text : "Button");

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      onPressIn={() => {
        pressProgress.value = withTiming(1, {
          duration: 30,
          easing: Easing.out(Easing.quad),
        });
      }}
      onPressOut={() => {
        pressProgress.value = withTiming(0, {
          duration: 30,
          easing: Easing.out(Easing.quad),
        });
      }}
      accessibilityRole="button"
      accessibilityLabel={resolvedA11yLabel}
      accessibilityHint={accessibilityHint}
      hitSlop={8}
    >
      <Animated.View style={[containerStyle, animatedStyle, style]}>
        {IconComponent ? (
          <IconComponent size={selectedSize.icon} color={fgColor} />
        ) : null}
        {text ? <Text style={textStyle}>{text}</Text> : null}
      </Animated.View>
    </Pressable>
  );
}
