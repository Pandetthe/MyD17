import { fonts } from "@/styles/fonts";
import React from "react";
import {
  StyleProp,
  Text,
  TextStyle,
  ColorValue,
  TextProps,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";

export type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "body"
  | "label";

export type FontWeight = "regular" | "medium" | "bold";
export type FontFamilyKey = keyof typeof fonts;
type TextColorRole = "primary" | "secondary";

type TextCoreProps = {
  variant?: TextVariant;
  color?: ColorValue;
  boldness?: FontWeight;
  fontFamily?: FontFamilyKey;
  style?: StyleProp<TextStyle>;
} & TextProps;

export default function TextCore({
  variant = "body",
  color,
  boldness,
  fontFamily = "sans",
  style,
  children,
  ...props
}: TextCoreProps) {
  const variantStyle = variantMap[variant];
  const resolvedWeight = boldness ?? variantStyle.defaultWeight;
  const resolvedFontFamily = fonts[fontFamily];

  const fontWeightMap: Record<FontWeight, TextStyle["fontWeight"]> = {
    regular: "400",
    medium: "500",
    bold: "700",
  };
  const resolvedFontWeight = fontWeightMap[resolvedWeight];

  return (
    <Text
      style={[
        styles.text(variant),
        { fontFamily: resolvedFontFamily, fontWeight: resolvedFontWeight },
        color && { color },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const variantMap: Record<
  TextVariant,
  {
    fontSize: number;
    lineHeight: number;
    defaultWeight: FontWeight;
    colorRole: TextColorRole;
  }
> = {
  h1: {
    fontSize: 24,
    lineHeight: 28,
    defaultWeight: "bold",
    colorRole: "primary",
  },
  h2: {
    fontSize: 18,
    lineHeight: 28,
    defaultWeight: "bold",
    colorRole: "primary",
  },
  h3: {
    fontSize: 16,
    lineHeight: 24,
    defaultWeight: "medium",
    colorRole: "primary",
  },
  body: {
    fontSize: 12,
    lineHeight: 16,
    defaultWeight: "regular",
    colorRole: "primary",
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    defaultWeight: "bold",
    colorRole: "primary",
  },
};

const styles = StyleSheet.create((theme) => {
  const textColors: Record<TextColorRole, string> = {
    primary: theme.colors.primary.text.primary,
    secondary: theme.colors.primary.text.secondary,
  };

  return {
    text: (variant: TextVariant) => {
      const { fontSize, lineHeight, colorRole } = variantMap[variant];
      const textColor = textColors[colorRole];

      return {
        fontSize,
        lineHeight,
        color: textColor,
      };
    },
  };
});
