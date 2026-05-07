import React from "react";
import { Pressable, View } from "react-native";
import IconPrimitive from "@/components/core/Icon.component";
import TextCore from "@/components/core/Text.component";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import type { CardColor } from "@/lib/strapiColors";
import { colors } from "@/styles/colors";
import type { AppColor } from "@/styles/colors";
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

const PALETTE: Record<
  CardColor,
  {
    bg: string;
    border: string;
    iconBg: AppColor;
    iconFg: AppColor;
    text: string;
    shadow: string;
    ellipseBg: string;
    arrowBg: string;
  }
> = {
  red: {
    bg: colors.red.extraLight,
    border: colors.red.main,
    iconBg: colors.red.light,
    iconFg: colors.red.main,
    text: colors.red.extraDark,
    shadow: "rgba(251,44,54,0.2)",
    ellipseBg: colors.red.light,
    arrowBg: colors.red.main,
  },
  green: {
    bg: colors.white,
    border: colors.green.main,
    iconBg: colors.green.light,
    iconFg: colors.green.main,
    text: colors.green.extraDark,
    shadow: "rgba(94,165,0,0.2)",
    ellipseBg: colors.green.light,
    arrowBg: colors.green.main,
  },
  teal: {
    bg: colors.teal.extraLight,
    border: colors.teal.main,
    iconBg: colors.teal.light,
    iconFg: colors.teal.main,
    text: colors.teal.extraDark,
    shadow: "rgba(0,146,184,0.2)",
    ellipseBg: colors.teal.light,
    arrowBg: colors.teal.main,
  },
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

const styles = StyleSheet.create({
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
    borderRadius: 24,
    padding: 16,
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
    top: 16,
    left: 18,
  },
  arrowButton: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 21,
    right: 24,
  },
  arrowButtonWide: {
    right: 17,
  },
  title: {
    position: "absolute",
    bottom: 14,
    left: 18,
    right: 54,
    lineHeight: 20,
  },
});
