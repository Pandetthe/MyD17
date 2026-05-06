import { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const SPRING = { damping: 15, stiffness: 400, mass: 0.8, overshootClamping: true } as const;

export function usePressAnimation(targetScale = 0.97) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => { scale.value = withSpring(targetScale, SPRING); };
  const onPressOut = () => { scale.value = withSpring(1, SPRING); };

  return { animStyle, onPressIn, onPressOut };
}
