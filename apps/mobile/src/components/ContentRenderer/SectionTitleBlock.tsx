import React from "react";
import { View, type ColorValue } from "react-native";
import TextCore from "@/components/core/Text.component";
import type { Theme } from "@/styles/themes/theme";
import type { ContentSectionTitle } from "@repo/types";
import { StyleSheet } from "react-native-unistyles";

export function SectionTitleBlock({
  block,
  color,
  isFirst = false,
}: {
  block: ContentSectionTitle;
  color?: ColorValue;
  isFirst?: boolean;
}) {
  return (
    <View style={!isFirst && styles.notFirst}>
      <TextCore variant="h1" weight="bold" color={color}>
        {block.content}
      </TextCore>
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  notFirst: {
    marginTop: theme.spacing.lg,
  },
}));
