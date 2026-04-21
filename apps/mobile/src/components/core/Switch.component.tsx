import { Pressable } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useEffect } from "react";

type SwitchProps = {
  onPress: () => void;
  value: number;
  duration?: number;
};

const SwitchCore = ({ onPress, value, duration = 150 }: SwitchProps) => {
  const { theme } = useUnistyles();
  const onColor = theme.colors.switch.on;
  const offColor = theme.colors.switch.off;
  const height = useSharedValue(0);
  const width = useSharedValue(0);
  const sharedValue = useSharedValue(value);
  useEffect(() => {
    sharedValue.value = value;
  }, [value]);

  const trackAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      sharedValue.value,
      [0, 1],
      [offColor, onColor],
    );
    const colorValue = withTiming(color, { duration });

    return {
      backgroundColor: colorValue,
      borderRadius: height.value / 2,
    };
  });

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const moveValue = interpolate(
      Number(sharedValue.value),
      [0, 1],
      [0, width.value - height.value],
    );
    const translateValue = withTiming(moveValue, { duration });

    return {
      transform: [{ translateX: translateValue }],
      borderRadius: height.value / 2,
    };
  });

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        onLayout={(e) => {
          height.value = e.nativeEvent.layout.height;
          width.value = e.nativeEvent.layout.width;
        }}
        style={[styles.track, trackAnimatedStyle]}
      >
        <Animated.View
          style={[styles.thumb, thumbAnimatedStyle]}
        ></Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export default SwitchCore;

const styles = StyleSheet.create((theme) => ({
  track: {
    alignItems: "flex-start",
    width: theme.size.xl,
    height: theme.size.md,
    padding: theme.spacing.half,
  },
  thumb: {
    height: "100%",
    aspectRatio: 1,
    backgroundColor: theme.colors.surface,
  },
}));
