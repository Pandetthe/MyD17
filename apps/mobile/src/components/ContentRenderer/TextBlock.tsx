import React from "react";
import type { ColorValue } from "react-native";
import TextCore from "@/components/core/Text.component";
import type { ContentText } from "@repo/types";

export function TextBlock({ block, color }: { block: ContentText; color?: ColorValue }) {
  return (
    <TextCore variant="body" color={color} style={{ textAlign: "justify" }}>
      {block.content}
    </TextCore>
  );
}
