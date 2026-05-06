import React from "react";
import { Pressable, Text, View } from "react-native";
import { colors } from "@/styles/colors";
import type { TailwindColorName } from "@repo/types";
import { ArrowRight, LucideIcon } from "lucide-react-native";
import { StyleSheet } from "react-native-unistyles";

type CardColor = "red" | "green" | "teal";

export function tailwindToCardColor(color: TailwindColorName | undefined): CardColor {
  if (!color) return "teal";
  if (["red", "orange", "amber", "pink", "rose", "fuchsia"].includes(color)) return "red";
  if (["green", "lime", "emerald", "yellow"].includes(color)) return "green";
  return "teal";
}

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
    iconBg: string;
    iconColor: string;
    text: string;
    shadow: string;
    ellipseBg: string;
    arrowBg: string;
  }
> = {
  red: {
    bg: "#fef2f2",
    border: "#e7000b",
    iconBg: "#ffc9c9",
    iconColor: "#e7000b",
    text: "#460809",
    shadow: "rgba(251,44,54,0.2)",
    ellipseBg: "#ffc9c9",
    arrowBg: "#e7000b",
  },
  green: {
    bg: colors.white,
    border: "#5ea500",
    iconBg: "#d8f999",
    iconColor: "#5ea500",
    text: "#032e15",
    shadow: "rgba(94,165,0,0.2)",
    ellipseBg: "#d8f999",
    arrowBg: "#5ea500",
  },
  teal: {
    bg: "#ecfeff",
    border: "#0092b8",
    iconBg: "#a2f4fd",
    iconColor: "#0092b8",
    text: "#053345",
    shadow: "rgba(0,146,184,0.2)",
    ellipseBg: "#a2f4fd",
    arrowBg: "#0092b8",
  },
};

export function StaticInfoCard({ title, icon: Icon, color, wide = false, onPress }: Props) {
  const p = PALETTE[color];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        wide && styles.cardWide,
        {
          backgroundColor: p.bg,
          borderColor: p.border,
          shadowColor: p.shadow,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      {/* dekoracyjna elipsa w prawym dolnym rogu */}
      <View
        style={[
          styles.ellipseLarge,
          wide && styles.ellipseLargeWide,
          { backgroundColor: p.ellipseBg },
        ]}
      />

      {/* ikona */}
      <View style={[styles.iconContainer, { backgroundColor: p.iconBg }]}>
        <Icon size={20} color={p.iconColor} strokeWidth={1.8} />
      </View>

      {/* przycisk strzałki */}
      <View style={[styles.arrowButton, wide && styles.arrowButtonWide, { backgroundColor: p.arrowBg }]}>
        <ArrowRight size={13} color={colors.white} strokeWidth={2.5} />
      </View>

      <Text style={[styles.title, { color: p.text }]} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    maxWidth: "50%",
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
    flex: 0,
    width: "100%",
    maxWidth: "100%",
    height: 150,
  },
  ellipseLarge: {
    position: "absolute",
    width: 94,
    height: 94,
    borderRadius: 47,
    right: -16,
    bottom: -12,
  },
  ellipseLargeWide: {
    right: -10,
    bottom: -12,
  },
  iconContainer: {
    width: 37.5,
    height: 37.5,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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
    right: 18,
  },
  arrowButtonWide: {
    right: 18,
  },
  title: {
    position: "absolute",
    bottom: 14,
    left: 18,
    right: 54,
    fontFamily: "Montserrat_700Bold",
    fontSize: 15,
    lineHeight: 20,
  },
});
