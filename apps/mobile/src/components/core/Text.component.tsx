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
  | "h1" // main screen titles
  | "h2" // section headers, primary category titles
  | "h3" // card titles, grouped settings headers
  //
  | "body" // default text
  | "bodySmall" // footnotes, secondary info
  | "subtitle" // text directly under headers
  //
  | "button"
  | "label" // form labels
  | "link"
  | "caption"; // image descriptions

export type FontWeight = "regular" | "medium" | "bold";
export type FontFamilyKey = keyof typeof fonts;
type TextColorRole = "primary" | "secondary" | "link";

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
    fontSize: 32,
    lineHeight: 40,
    defaultWeight: "bold",
    colorRole: "primary",
  },
  h2: {
    fontSize: 26,
    lineHeight: 32,
    defaultWeight: "bold",
    colorRole: "primary",
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    defaultWeight: "bold",
    colorRole: "primary",
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    defaultWeight: "regular",
    colorRole: "primary",
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 18,
    defaultWeight: "regular",
    colorRole: "primary",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    defaultWeight: "medium",
    colorRole: "primary",
  },
  button: {
    fontSize: 14,
    lineHeight: 20,
    defaultWeight: "regular",
    colorRole: "primary",
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    defaultWeight: "medium",
    colorRole: "primary",
  },
  link: {
    fontSize: 14,
    lineHeight: 22,
    defaultWeight: "bold",
    colorRole: "link",
  },
  caption: {
    fontSize: 10,
    lineHeight: 14,
    defaultWeight: "regular",
    colorRole: "secondary",
  },
};

const styles = StyleSheet.create((theme) => {
  const textColors: Record<TextColorRole, string> = {
    primary: theme.colors.text.primary,
    secondary: theme.colors.text.secondary,
    link: theme.colors.text.link,
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
