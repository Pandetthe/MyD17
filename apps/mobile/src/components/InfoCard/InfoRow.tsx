import React from "react";
import { View } from "react-native";
import TextCore from "@/components/core/Text.component";
import { colors } from "@/styles/colors";
import type { Theme } from "@/styles/themes/theme";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type Props = {
  icon: (color: string) => React.ReactNode;
  label: string;
  value: string;
  dark?: boolean;
};

export function InfoRow({ icon, label, value, dark = false }: Props) {
  const { theme } = useUnistyles();
  const isDark = theme.mode === "dark";

  const labelColor = dark ? colors.core.light : colors.core.main;
  let valueColor: string;
  if (dark) valueColor = colors.white;
  else if (isDark) valueColor = colors.core.extraLight;
  else valueColor = colors.core.dark;
  const iconBg = dark || isDark ? colors.core.main : colors.core.disabled;
  const iconFg = dark || isDark ? colors.core.dark : colors.core.main;

  return (
    <View style={styles.row}>
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>{icon(iconFg)}</View>
      <View style={styles.textColumn}>
        <TextCore variant="label" color={labelColor} style={styles.label}>
          {label}
        </TextCore>
        <TextCore variant="h3" color={valueColor} weight="medium">
          {value}
        </TextCore>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
  },
  iconContainer: {
    width: 37,
    height: 37,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  label: {
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
}));
