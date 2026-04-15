import React from "react";
import * as LucideIcons from "lucide-react-native";
import { LucideProps } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { type LightTheme } from "@/styles/themes/light";
import { View } from "react-native";

export type IconName = keyof typeof LucideIcons;
type IconColor = Exclude<keyof LightTheme["colors"], "canvas">;

interface IconProps extends LucideProps {
  name: IconName;
  color?: IconColor;
}

const styles = StyleSheet.create((theme) => ({
  container: (color: IconColor) => ({
    height: 48,
    width: 48,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors[color].secondary,
    alignItems: "center",
    justifyContent: "center",
  }),
}));

export default function Icon({ name, color = "accent" }: IconProps) {
  const { theme } = useUnistyles();
  const LucideIcon = LucideIcons[name] as React.FC<LucideProps>;

  return (
    <View style={styles.container(color)}>
      <LucideIcon size={24} color={theme.colors[color].primary} />
    </View>
  );
}
