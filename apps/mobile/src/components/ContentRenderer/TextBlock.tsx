import React from "react";
import TextCore from "@/components/core/Text.component";
import type { ContentText } from "@repo/types";

export function TextBlock({ block }: { block: ContentText }) {
  return (
    <TextCore variant="body" style={{ textAlign: "justify" }}>
      {block.content}
    </TextCore>
  );
}
