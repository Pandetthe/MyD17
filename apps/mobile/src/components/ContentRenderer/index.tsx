import React from "react";
import { View, type ColorValue } from "react-native";
import { CalendarBlock } from "@/components/ContentRenderer/CalendarBlock";
import { SectionTitleBlock } from "@/components/ContentRenderer/SectionTitleBlock";
import { TextBlock } from "@/components/ContentRenderer/TextBlock";
import { InfoCard } from "@/components/InfoCard";
import type { CalendarEvent } from "@/features/posts/hooks/useAddToCalendar";
import type { Theme } from "@/styles/themes/theme";
import type { PostContentBlock } from "@repo/types";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  blocks: PostContentBlock[];
  textColor?: ColorValue;
  dark?: boolean;
  onAddToCalendar?: (event: CalendarEvent) => void;
  onLocationPress?: (room: string) => void;
};

const INFO_COMPONENTS = new Set(["content.chip", "content.location", "content.event-date-time"]);

type RenderedBlock =
  | { type: "info"; blocks: PostContentBlock[]; key: string }
  | { type: "single"; block: PostContentBlock };

function groupBlocks(blocks: PostContentBlock[]): RenderedBlock[] {
  const result: RenderedBlock[] = [];
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];
    if (INFO_COMPONENTS.has(block.__component ?? "")) {
      const group: PostContentBlock[] = [];
      const key = `info-card-${block.id ?? i}`;
      while (i < blocks.length && INFO_COMPONENTS.has(blocks[i].__component ?? "")) {
        group.push(blocks[i]);
        i++;
      }
      result.push({ type: "info", blocks: group, key });
    } else {
      result.push({ type: "single", block });
      i++;
    }
  }
  return result;
}

export function ContentRenderer({
  blocks,
  textColor,
  dark,
  onAddToCalendar,
  onLocationPress,
}: Props) {
  const grouped = groupBlocks(blocks);

  return (
    <View style={styles.container}>
      {grouped.map((item) => {
        if (item.type === "info") {
          return (
            <InfoCard
              key={item.key}
              blocks={item.blocks}
              dark={dark}
              onAddToCalendar={onAddToCalendar}
              onLocationPress={onLocationPress}
            />
          );
        }
        const block = item.block;
        switch (block.__component) {
          case "content.text":
            return (
              <TextBlock key={`${block.__component}-${block.id}`} block={block} color={textColor} />
            );
          case "content.section-title":
            return (
              <SectionTitleBlock
                key={`${block.__component}-${block.id}`}
                block={block}
                color={textColor}
              />
            );
          case "content.calendar":
            return (
              <CalendarBlock key={`${block.__component}-${block.id}`} block={block} dark={dark} />
            );
          default:
            return null;
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  container: {
    gap: theme.spacing.sm,
  },
}));
