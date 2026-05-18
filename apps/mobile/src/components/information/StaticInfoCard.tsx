import React from "react";
import { Pressable, View } from "react-native";
import IconPrimitive from "@/components/core/Icon.component";
import TextCore from "@/components/core/Text.component";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { colors } from "@/styles/colors";
import type { Theme, ColorPalette } from "@/styles/themes/theme";
import { ArrowRight, LucideIcon } from "lucide-react-native";
import Animated from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type Props = {
  title: string;
  icon: LucideIcon;
  color: ColorPalette;
  wide?: boolean;
  onPress: () => void;
};

export function StaticInfoCard({ title, icon, color, wide = false, onPress }: Props) {
  const { theme } = useUnistyles();
  const palette = theme.colors[color] as Theme["colors"]["red"]; // Use any color palette as they share the same structure
  const { animStyle, onPressIn, onPressOut } = usePressAnimation(0.97);
  const isDark = theme.colors.surface === colors.core.extraDark;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={wide ? styles.pressableWide : styles.pressable}
    >
      <Animated.View
        style={[
          styles.card,
          wide && styles.cardWide,
          {
            backgroundColor: palette.background.main,
            borderColor: palette.main,
            shadowColor: palette.main,
          },
          animStyle,
        ]}
      >
        <View
          style={[
            styles.ellipseLarge,
            wide && styles.ellipseLargeWide,
            { backgroundColor: palette.background.accent, opacity: isDark ? 0.5 : 1 },
          ]}
        />

        <View style={styles.iconWrapper}>
          <IconPrimitive icon={icon} color={color} />
        </View>

        <View
          style={[
            styles.arrowButton,
            wide && styles.arrowButtonWide,
            { backgroundColor: palette.main },
          ]}
        >
          <ArrowRight size={13} color={colors.white} strokeWidth={2.5} />
        </View>

        <TextCore
          variant="h3"
          weight="bold"
          color={palette.text.primary}
          numberOfLines={2}
          style={styles.title}
        >
          {title}
        </TextCore>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  pressable: {
    flex: 1,
    maxWidth: "50%",
  },
  pressableWide: {
    width: "100%",
  },
  card: {
    flex: 1,
    height: 150,
    borderWidth: 0.75,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    overflow: "hidden",
    shadowOffset: { width: 7.5, height: 7.5 },
    shadowOpacity: 1,
    shadowRadius: 22.5,
    elevation: 5,
  },
  cardWide: {
    height: 131,
  },
  ellipseLarge: {
    position: "absolute",
    width: 94,
    height: 94,
    borderRadius: 47,
    right: -26,
    bottom: -25,
  },
  ellipseLargeWide: {
    right: -17,
    bottom: -28,
  },
  iconWrapper: {
    position: "absolute",
    top: theme.spacing.md,
    left: 18,
  },
  arrowButton: {
    width: 27,
    height: 27,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 21,
    right: theme.spacing.lg,
  },
  arrowButtonWide: {
    right: 17,
  },
  title: {
    position: "absolute",
    bottom: 14,
    left: 18,
    right: 54,
    lineHeight: theme.size.md,
  },
}));
