import React from "react";
import type { ColorValue } from "react-native";
import TextCore from "@/components/core/Text.component";
import type { ContentSectionTitle } from "@repo/types";

export function SectionTitleBlock({
  block,
  color,
}: {
  block: ContentSectionTitle;
  color?: ColorValue;
}) {
  return (
    <TextCore variant="h1" weight="bold" color={color}>
      {block.content}
    </TextCore>
  );
}
