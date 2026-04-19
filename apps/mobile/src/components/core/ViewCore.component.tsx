import { spacing } from "@/styles/tokens";
import React from "react";
import {
  View,
  ScrollView,
  Keyboard,
  StyleProp,
  ViewStyle,
  ViewProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

type Variant = "page" | "card" | "subtle" | "muted" | "inverse";
type RadiusVariant = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full";

type VariantPreset = {
  padding?: number;
  paddingHorizontal?: number;
  radius: RadiusVariant;
  shadow: boolean;
};

const variantPresets: Record<Variant, VariantPreset> = {
  page: { paddingHorizontal: spacing.four, radius: "none", shadow: false },
  card: { padding: spacing.three, radius: "xl", shadow: true },
  subtle: { padding: spacing.two, radius: "xl", shadow: false },
  muted: { padding: spacing.two, radius: "sm", shadow: false },
  inverse: { padding: spacing.three, radius: "xl", shadow: false },
};

type ViewCoreProps = {
  variant?: Variant;
  radius?: RadiusVariant;
  shadow?: boolean;
  safe?: boolean;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
} & ViewProps;

export default function ViewCore({
  variant = "page",
  radius,
  shadow,
  safe = false,
  scrollable = variant === "page",
  style,
  children,
  ...props
}: ViewCoreProps) {
  const preset = variantPresets[variant];

  const resolvedRadius = radius ?? preset.radius;
  const resolvedShadow = shadow ?? preset.shadow;

  const paddingStyle = {
    padding: preset.padding,
    paddingHorizontal: preset.paddingHorizontal,
  };
  const baseStyle = [
    styles.base(variant, resolvedRadius),
    resolvedShadow && shadowStyle,
  ];

  const Wrapper = safe ? SafeAreaView : View;
  const wrapperStyle = scrollable
    ? [...baseStyle, styles.fill]
    : [...baseStyle, paddingStyle, style];

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[paddingStyle, style]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={Keyboard.dismiss}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <Wrapper style={wrapperStyle} {...props}>
      {content}
    </Wrapper>
  );
}

const styles = StyleSheet.create((theme) => ({
  base: (variant: Variant, resolvedRadius: RadiusVariant) => ({
    backgroundColor: theme.colors.bg[variant],
    borderRadius: theme.radius[resolvedRadius],
  }),
  fill: {
    flex: 1,
  },
}));

const shadowStyle: ViewStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.05,
  shadowRadius: 20,
  elevation: 3,
};
