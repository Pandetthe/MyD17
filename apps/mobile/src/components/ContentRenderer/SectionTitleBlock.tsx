import React from "react";
import TextCore from "@/components/core/Text.component";
import type { ContentSectionTitle } from "@repo/types";
import type { ColorValue } from "react-native";

export function SectionTitleBlock({ block, color }: { block: ContentSectionTitle; color?: ColorValue }) {
  return (
    <TextCore variant="h3" weight="bold" color={color} style={{ marginTop: 4 }}>
      {block.content}
    </TextCore>
  );
}
