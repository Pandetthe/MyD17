import React from "react";
import type { ColorValue } from "react-native";
import TextCore from "@/components/core/Text.component";
import type { ContentText } from "@repo/types";

export function TextBlock({ block, color }: { block: ContentText; color?: ColorValue }) {
  if (block.isHeader) {
    return (
      <TextCore variant="h1" color={color} style={{ letterSpacing: -0.5, marginTop: 16 }}>
        {block.content}
      </TextCore>
    );
  }
  return (
    <TextCore variant="body" color={color} style={{ textAlign: "justify" }}>
      {block.content}
    </TextCore>
  );
}
