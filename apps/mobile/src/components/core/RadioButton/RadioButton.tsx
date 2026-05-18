import { StyleProp, TextStyle } from "react-native";
import { Pressable } from "react-native";
import { useRadioButtonContext } from "@/components/core/RadioButton/RadioButton.context";
import TextCore from "@/components/core/Text.component";
import { palette } from "@/styles/colors";
import { ColorPalette, PaletteColor } from "@/styles/themes/theme";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

const RADIO_SIZE = 20;
const INNER_DOT_SIZE = 10;
const BORDER_WIDTH = 2;

export type RadioButtonProps = {
  label: string;
  value: string;
  disabled?: boolean;
  color?: ColorPalette;
  position?: "leading" | "trailing";
  labelStyle?: StyleProp<TextStyle>;
};

export default function RadioButton({
  label,
  value,
  disabled = false,
  color = "primary",
  position = "leading",
  labelStyle,
}: RadioButtonProps) {
  const { theme } = useUnistyles();
  const context = useRadioButtonContext();

  const isChecked = context?.value === value;

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(isChecked ? 1 : 0, { duration: 250 }) }],
  }));

  const handlePress = () => {
    if (disabled) return;
    context?.onValueChange(value);
  };

  const isRaw = color !== "primary" && color !== "dark" && color in palette;
  const tcKey = color === "primary" || color === "dark" ? color : "primary";
  const rawC = isRaw ? palette[color as PaletteColor] : null;
  const tc = !isRaw ? theme.colors[tcKey] : null;

  const accent = rawC ? rawC.main : tc!.main;
  let borderColor: string;
  if (isChecked) borderColor = accent;
  else if (rawC) borderColor = rawC.light;
  else borderColor = tc!.bgAccent;

  const radioCircle = (
    <Animated.View
      style={[
        styles.circle,
        {
          borderColor,
          backgroundColor: isChecked ? accent : "transparent",
        },
      ]}
    >
      <Animated.View style={[styles.dot, { backgroundColor: theme.colors.dark.main }, dotStyle]} />
    </Animated.View>
  );

  return (
    <Pressable
      style={[styles.row, disabled && { opacity: 0.4 }]}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: isChecked, disabled }}
      accessibilityLabel={label}
    >
      {position === "leading" && radioCircle}
      <TextCore
        variant="label"
        style={[styles.label, position === "leading" && styles.labelLeading, labelStyle]}
      >
        {label}
      </TextCore>
      {position === "trailing" && radioCircle}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    gap: theme.spacing.two,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.two,
    paddingVertical: theme.spacing.two,
  },
  label: {
    flexShrink: 1,
    flexGrow: 1,
  },
  labelLeading: {
    textAlign: "right",
  },
  circle: {
    width: RADIO_SIZE,
    height: RADIO_SIZE,
    borderRadius: RADIO_SIZE / 2,
    borderWidth: BORDER_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    margin: 2,
  },
  dot: {
    width: INNER_DOT_SIZE,
    height: INNER_DOT_SIZE,
    borderRadius: INNER_DOT_SIZE / 2,
  },
}));
