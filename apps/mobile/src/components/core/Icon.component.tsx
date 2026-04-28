import React from "react";
import { LucideIcon } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { View } from "react-native";
import { ColorPalette, Theme } from "@/styles/themes/theme";

interface IconProps {
  icon: LucideIcon;
  color?: ColorPalette;
  hasBackground?: boolean;
}

const styles = StyleSheet.create((theme: Theme) => ({
  container: (color: ColorPalette) => ({
    height: theme.size.xl,
    width: theme.size.xl,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors[color].background.accent,
    alignItems: "center",
    justifyContent: "center",
  }),
}));

export default function Icon({ icon, color = "primary", hasBackground = true }: IconProps) {
  const { theme } = useUnistyles();

  const IconComponent = icon;

  if (!hasBackground) {
    return (
        <IconComponent size={theme.size.lg} color={theme.colors[color].main}/>
    )
  }

  return (
    <View style={styles.container(color)}>
      <IconComponent size={theme.size.md} color={theme.colors[color].main} />
    </View>
  );
}
