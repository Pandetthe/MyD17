import React from "react";
import TextCore from "@/components/core/Text.component";
import type { ContentText } from "@repo/types";
import type { ColorValue } from "react-native";

export function TextBlock({ block, color }: { block: ContentText; color?: ColorValue }) {
  return (
    <TextCore variant="body" color={color} style={{ textAlign: "justify" }}>
      {block.content}
    </TextCore>
  );
}
