import React, { useMemo } from "react";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { palette } from "@/styles/colors";
import type { ColorPalette, PaletteColor, Theme } from "@/styles/themes/theme";
import { LinearGradient } from "expo-linear-gradient";
import Animated from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type AbsPos = { top?: number; bottom?: number; left?: number; right?: number };

type CircleMode =
  | { circle?: "none" }
  | { circle: "fixed" }
  | { circle: "hash"; hashKey: string };

type CardProps = {
  color?: ColorPalette;
  /** Optional two-stop gradient rendered as card background (top-left → bottom-right). */
  gradient?: readonly [string, string];
  onPress?: () => void;
  /** Applies to the outermost element (Pressable when interactive, View otherwise). */
  style?: StyleProp<ViewStyle>;
  /** Applies to the inner card shell — use for height, padding, flexDirection, etc. */
  contentStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
} & CircleMode;

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

const HASH_CIRCLE_SIZE = 300;

function hashToPos(key: string): AbsPos {
  const h = djb2(key);
  const corner = h % 4;
  const offset = -(HASH_CIRCLE_SIZE / 6 + (h % 20));
  switch (corner) {
    case 0: return { top: offset, left: offset };
    case 1: return { top: offset, right: offset };
    case 2: return { bottom: offset, left: offset };
    default: return { bottom: offset, right: offset };
  }
}

export function Card(props: CardProps) {
  const { color = "primary", gradient, onPress, style, contentStyle, children } = props;
  const { theme } = useUnistyles();
  const { animStyle, onPressIn, onPressOut } = usePressAnimation(0.97);

  const isDark = theme.mode === "dark";
  const isRaw = color !== "primary" && color !== "dark" && color in palette;
  const tcKey = (color === "primary" || color === "dark") ? color : "primary";
  const rawC = isRaw ? palette[color as PaletteColor] : null;
  const tc = !isRaw ? theme.colors[tcKey] : null;

  const main = rawC ? rawC.main : tc!.main;
  const circleColor = rawC ? rawC.light : tc!.bgAccent;
  const bg = gradient
    ? undefined
    : rawC
      ? (isDark ? rawC.main + "1A" : rawC.extraLight)
      : theme.colors.surface;

  const circleMode = (props as any).circle ?? "none";
  const hashKey: string | undefined = circleMode === "hash" ? (props as any).hashKey : undefined;

  const circlePos = useMemo((): AbsPos | null => {
    if (circleMode === "fixed") return { bottom: -25, right: -26 };
    if (circleMode === "hash" && hashKey) return hashToPos(hashKey);
    return null;
  }, [circleMode, hashKey]);

  const circleSizeStyle: ViewStyle =
    circleMode === "fixed"
      ? { width: 110, height: 110 }
      : { width: HASH_CIRCLE_SIZE, height: HASH_CIRCLE_SIZE };

  const shell = (
    <View
      style={[
        styles.shadowShell,
        { borderColor: main, shadowColor: main, backgroundColor: bg ?? gradient?.[0] },
      ]}
    >
      <View style={[styles.contentShell, { backgroundColor: bg ?? gradient?.[0] }, contentStyle]}>
        {gradient && (
          <LinearGradient
            colors={[gradient[0], gradient[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.absoluteFill}
          />
        )}
        {circlePos && (
          <View
            pointerEvents="none"
            style={[
              styles.circle,
              circleSizeStyle,
              circlePos,
              { backgroundColor: circleColor },
            ]}
          />
        )}
        {children}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={style}>
        <Animated.View style={[styles.fill, animStyle]}>{shell}</Animated.View>
      </Pressable>
    );
  }

  return <View style={style}>{shell}</View>;
}

const styles = StyleSheet.create((theme: Theme) => ({
  shadowShell: {
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
  },
  contentShell: {
    borderRadius: theme.borderRadius.lg - 1,
    overflow: "hidden",
  },
  fill: {},
  absoluteFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: "absolute",
    borderRadius: 9999,
    opacity: 0.6,
    overflow: "hidden",
  },
}));
