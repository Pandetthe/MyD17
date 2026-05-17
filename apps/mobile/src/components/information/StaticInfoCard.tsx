import React from "react";
import { Pressable, View } from "react-native";
import IconPrimitive from "@/components/core/Icon.component";
import TextCore from "@/components/core/Text.component";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import type { CardColor } from "@/lib/strapiColors";
import { colors } from "@/styles/colors";
import type { AppColor } from "@/styles/colors";
import type { Theme } from "@/styles/themes/theme";
import { ArrowRight, LucideIcon } from "lucide-react-native";
import Animated from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  title: string;
  icon: LucideIcon;
  color: CardColor;
  wide?: boolean;
  onPress: () => void;
};

type ColorScale = { extraDark: string; dark: string; main: string; light: string; extraLight: string };

function paletteEntry(c: ColorScale, shadow: string) {
  return {
    bg: c.extraLight,
    border: c.main,
    iconBg: c.light as AppColor,
    iconFg: c.main as AppColor,
    text: c.extraDark,
    shadow,
    ellipseBg: c.light,
    arrowBg: c.main,
  };
}

const PALETTE: Record<CardColor, ReturnType<typeof paletteEntry>> = {
  red:     paletteEntry(colors.red,     "rgba(231,0,11,0.2)"),
  rose:    paletteEntry(colors.rose,    "rgba(244,63,94,0.2)"),
  orange:  paletteEntry(colors.orange,  "rgba(249,115,22,0.2)"),
  amber:   paletteEntry(colors.amber,   "rgba(246,162,0,0.2)"),
  yellow:  paletteEntry(colors.yellow,  "rgba(234,179,8,0.2)"),
  lime:    paletteEntry(colors.lime,    "rgba(132,204,22,0.2)"),
  green:   paletteEntry(colors.green,   "rgba(94,165,0,0.2)"),
  emerald: paletteEntry(colors.emerald, "rgba(16,185,129,0.2)"),
  teal:    paletteEntry(colors.teal,    "rgba(0,146,184,0.2)"),
  cyan:    paletteEntry(colors.cyan,    "rgba(6,182,212,0.2)"),
  sky:     paletteEntry(colors.sky,     "rgba(14,165,233,0.2)"),
  blue:    paletteEntry(colors.blue,    "rgba(59,130,246,0.2)"),
  indigo:  paletteEntry(colors.indigo,  "rgba(99,102,241,0.2)"),
  violet:  paletteEntry(colors.violet,  "rgba(139,92,246,0.2)"),
  purple:  paletteEntry(colors.purple,  "rgba(118,61,169,0.2)"),
  fuchsia: paletteEntry(colors.fuchsia, "rgba(217,70,239,0.2)"),
  pink:    paletteEntry(colors.pink,    "rgba(222,38,112,0.2)"),
};

export function StaticInfoCard({ title, icon, color, wide = false, onPress }: Props) {
  const p = PALETTE[color];
  const { animStyle, onPressIn, onPressOut } = usePressAnimation(0.97);

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
          { backgroundColor: p.bg, borderColor: p.border, shadowColor: p.shadow },
          animStyle,
        ]}
      >
        <View
          style={[
            styles.ellipseLarge,
            wide && styles.ellipseLargeWide,
            { backgroundColor: p.ellipseBg },
          ]}
        />

        <View style={styles.iconWrapper}>
          <IconPrimitive icon={icon} bg={p.iconBg} fg={p.iconFg} />
        </View>

        <View
          style={[
            styles.arrowButton,
            wide && styles.arrowButtonWide,
            { backgroundColor: p.arrowBg },
          ]}
        >
          <ArrowRight size={13} color={colors.white} strokeWidth={2.5} />
        </View>

        <TextCore variant="h3" weight="bold" color={p.text} numberOfLines={2} style={styles.title}>
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
