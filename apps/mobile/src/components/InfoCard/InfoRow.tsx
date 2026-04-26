import React from "react";
import { View } from "react-native";
import TextCore from "@/components/core/Text.component";
import type { Theme } from "@/styles/themes/theme";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type Props = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

export function InfoRow({ icon, label, value }: Props) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.row}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.textColumn}>
        <TextCore variant="label" color={theme.colors.primary.main} style={styles.label}>
          {label}
        </TextCore>
        <TextCore variant="h3" color={theme.colors.dark.main} weight="medium">
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
    backgroundColor: theme.colors.primary.background.accent,
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
