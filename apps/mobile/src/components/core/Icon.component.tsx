import React from "react";
import * as LucideIcons from "lucide-react-native";
import { LucideProps } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { View } from "react-native";
import { ColorPalette } from "@/styles/themes/theme";

export type IconName = keyof typeof LucideIcons;

interface IconProps {
  name: IconName;
  color?: ColorPalette;
  hasBackground?: boolean;
}

const styles = StyleSheet.create((theme) => ({
  container: (color: ColorPalette) => ({
    height: theme.size.xl,
    width: theme.size.xl,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors[color].background.accent,
    alignItems: "center",
    justifyContent: "center",
  }),
}));

export default function Icon({
  name,
  color = "primary",
  hasBackground = true,
}: IconProps) {
  const { theme } = useUnistyles();
  const LucideIcon = LucideIcons[name] as React.FC<LucideProps>;

  return (
    <View style={hasBackground ? styles.container(color) : undefined}>
      <LucideIcon size={theme.size.md} color={theme.colors[color].main} />
    </View>
  );
}
