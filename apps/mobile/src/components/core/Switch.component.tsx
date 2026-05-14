import { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { useAnimatedTheme } from "react-native-unistyles/reanimated";

type SwitchProps = {
  onPress: () => void;
  value: boolean;
  duration?: number;
};

const SwitchCore = ({ onPress, value, duration = 150 }: SwitchProps) => {
  const theme = useAnimatedTheme();
  const height = useSharedValue(0);
  const width = useSharedValue(0);
  const sharedValue = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    sharedValue.value = value ? 1 : 0;
  }, [value]);

  const trackAnimatedStyle = useAnimatedStyle(() => {
    const onColor = theme.value.colors.switch.on;
    const offColor = theme.value.colors.switch.off;

    const color = interpolateColor(sharedValue.value, [0, 1], [offColor, onColor]);

    return {
      backgroundColor: withTiming(color, { duration }),
      borderRadius: height.value / 2,
    };
  });

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const moveValue = interpolate(sharedValue.value, [0, 1], [0, width.value - height.value]);

    return {
      transform: [{ translateX: withTiming(moveValue, { duration }) }],
      borderRadius: height.value / 2,
      backgroundColor: theme.value.colors.surface,
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
        <Animated.View style={[styles.thumb, thumbAnimatedStyle]} />
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
  },
}));
