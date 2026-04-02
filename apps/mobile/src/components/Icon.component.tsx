import React from "react";
import * as LucideIcons from "lucide-react-native";
import { LucideProps } from "lucide-react-native";
import { StyleSheet, View, useColorScheme } from "react-native";
import { Colors, ThemeColor } from "@/constants/theme";

export type IconName = keyof typeof LucideIcons;

interface IconProps extends LucideProps {
  name: IconName;
  color?: ThemeColor;
}

export default function Icon({ name, color = "accent" }: IconProps) {
  const LucideIcon = LucideIcons[name] as React.FC<LucideProps>;

  const styles = StyleSheet.create({
    container: {
      height: 48,
      width: 48,
      borderRadius: 16,
      backgroundColor: Colors["light"][color].secondary,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return (
    <View style={styles.container}>
      <LucideIcon size="24" color={Colors["light"][color].primary} />
    </View>
  );
}
