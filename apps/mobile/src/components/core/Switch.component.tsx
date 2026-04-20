import React from 'react';
import {
    Pressable,
} from 'react-native';
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    SharedValue,
} from 'react-native-reanimated';
import { StyleSheet } from "react-native-unistyles";

type SwitchProps = {
    onPress: () => void;
    value: SharedValue<number>;
    duration?: number;
}

const SwitchCore = ({
                    onPress,
                    value,
                    duration = 150,
                }: SwitchProps) => {
    const height = useSharedValue(0);
    const width = useSharedValue(0);

    const trackAnimatedStyle = useAnimatedStyle(() => {
        const color = interpolateColor(
            value.value,
            [0, 1],
            [styles.track.offColor, styles.track.onColor]
        );
        const colorValue = withTiming(color, { duration });

        return {
            backgroundColor: colorValue,
            borderRadius: height.value / 2,
        };
    });

    const thumbAnimatedStyle = useAnimatedStyle(() => {
        const moveValue = interpolate(
            Number(value.value),
            [0, 1],
            [0, width.value - height.value]
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
                style={[styles.track, trackAnimatedStyle]}>
                <Animated.View
                    style={[styles.thumb, thumbAnimatedStyle]}></Animated.View>
            </Animated.View>
        </Pressable>
    );
};

export default SwitchCore;

const styles = StyleSheet.create((theme) => ({
    track: {
        alignItems: 'flex-start',
        width: 48,
        height: 24,
        padding: 2,
        onColor: "#1065AF",
        offColor: "#BAD7F1"
    },
    thumb: {
        height: '100%',
        aspectRatio: 1,
        backgroundColor: theme.colors.surface
    },
}));