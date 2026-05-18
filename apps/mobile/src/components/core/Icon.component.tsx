import React from "react";
import { View } from "react-native";
import { AppColor } from "@/styles/colors";
import { ColorPalette, Theme } from "@/styles/themes/theme";
import { LucideIcon } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type ThemeIconProps = {
  color?: ColorPalette;
  bg?: never;
  fg?: never;
};

type RawIconProps = {
  color?: never;
  bg: AppColor;
  fg: AppColor;
};

type IconProps = { icon: LucideIcon; hasBackground?: boolean } & (ThemeIconProps | RawIconProps);

const styles = StyleSheet.create((theme: Theme) => ({
  container: {
    height: theme.size.xl,
    width: theme.size.xl,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
}));

function resolveColors(colorProps: ThemeIconProps | RawIconProps, theme: Theme) {
  if (colorProps.bg) return { bg: colorProps.bg, fg: colorProps.fg };
  const palette = theme.colors[colorProps.color ?? "primary"];
  return { bg: palette.background.accent, fg: palette.icon };
}

export default function Icon({
  icon: IconComponent,
  hasBackground = true,
  ...colorProps
}: IconProps) {
  const { theme } = useUnistyles();
  const { bg, fg } = resolveColors(colorProps, theme);

  if (!hasBackground) {
    return <IconComponent color={fg} size={theme.size.lg} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <IconComponent color={fg} size={theme.size.md} />
    </View>
  );
}
