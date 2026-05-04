import React from "react";
import { View } from "react-native";
import { ColorPalette, Theme } from "@/styles/themes/theme";
import { LucideIcon } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type IconProps = {
  icon: LucideIcon;
  color?: ColorPalette;
  hasBackground?: boolean;
};

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
  const IconEl = ({size}: {size: number}) => {
    return <IconComponent color={theme.colors[color].main} size={size}/>
  }

  if (!hasBackground) {
    return (
        <IconEl size={theme.size.lg}/>
    )
  }

  return (
    <View style={styles.container(color)}>
      <IconEl size={theme.size.md}/>
    </View>
  );
}
