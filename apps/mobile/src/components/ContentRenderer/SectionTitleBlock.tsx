import React from "react";
import TextCore from "@/components/core/Text.component";
import type { ContentSectionTitle } from "@/features/posts/types/post.types";

export function SectionTitleBlock({ block }: { block: ContentSectionTitle }) {
  return (
    <TextCore variant="h3" weight="bold" style={{ marginTop: 4 }}>
      {block.content}
    </TextCore>
  );
}
