import React from "react";
import { View } from "react-native";
import { AppColor, colors, palette } from "@/styles/colors";
import { ColorPalette, PaletteColor, Theme } from "@/styles/themes/theme";
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

function resolveColors(colorProps: ThemeIconProps | RawIconProps, isDark: boolean) {
  if (colorProps.bg) return { bg: colorProps.bg, fg: colorProps.fg };
  const color = colorProps.color ?? "primary";
  const isRaw = color !== "primary" && color !== "dark" && color in palette;
  if (isRaw) {
    const c = palette[color as PaletteColor];
    return {
      bg: isDark ? c.main + "1A" : c.light,
      fg: isDark ? c.extraLight : c.main,
    };
  }
  return {
    bg: isDark ? colors.core.dark : colors.core.disabled,
    fg: colors.core.main,
  };
}

export default function Icon({
  icon: IconComponent,
  hasBackground = true,
  ...colorProps
}: IconProps) {
  const { theme } = useUnistyles();
  const isDark = theme.mode === "dark";
  const { bg, fg } = resolveColors(colorProps, isDark);

  if (!hasBackground) {
    return <IconComponent color={fg} size={theme.size.lg} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <IconComponent color={fg} size={theme.size.md} />
    </View>
  );
}
