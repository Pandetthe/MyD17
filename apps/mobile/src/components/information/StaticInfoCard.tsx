import React from "react";
import { View } from "react-native";
import { Card } from "@/components/core/Card.component";
import IconPrimitive from "@/components/core/Icon.component";
import TextCore from "@/components/core/Text.component";
import { palette } from "@/styles/colors";
import type { ColorPalette, PaletteColor, Theme } from "@/styles/themes/theme";
import { ArrowRight, LucideIcon } from "lucide-react-native";
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
  const isDark = theme.mode === "dark";
  const c = palette[color as PaletteColor] ?? palette.teal;
  const textColor = isDark ? c.extraLight : c.extraDark;

  return (
    <Card
      color={color}
      circle="fixed"
      onPress={onPress}
      style={wide ? styles.pressableWide : styles.pressable}
      contentStyle={[styles.card, wide && styles.cardWide]}
    >
      <View style={styles.iconWrapper}>
        <IconPrimitive icon={icon} color={color} />
      </View>

      <View style={[styles.arrowButton, { backgroundColor: c.main }]}>
        <ArrowRight size={13} color="#ffffff" strokeWidth={2.5} />
      </View>

      <TextCore variant="h3" weight="bold" color={textColor} numberOfLines={2} style={styles.title}>
        {title}
      </TextCore>
    </Card>
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
    padding: theme.spacing.md,
  },
  cardWide: {
    height: 131,
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
  title: {
    position: "absolute",
    bottom: 14,
    left: 18,
    right: 54,
    lineHeight: theme.size.md,
  },
}));
