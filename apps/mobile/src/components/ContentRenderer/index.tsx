import React from "react";
import { View, type ColorValue } from "react-native";
import { CalendarBlock } from "@/components/ContentRenderer/CalendarBlock";
import { SectionTitleBlock } from "@/components/ContentRenderer/SectionTitleBlock";
import { TextBlock } from "@/components/ContentRenderer/TextBlock";
import { InfoCard } from "@/components/InfoCard";
import type { Theme } from "@/styles/themes/theme";
import type { PostContentBlock } from "@repo/types";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  blocks: PostContentBlock[];
  textColor?: ColorValue;
  dark?: boolean;
};

export function ContentRenderer({ blocks, textColor, dark }: Props) {
  const hasInfoBlocks = blocks.some(
    (b) =>
      b.__component === "content.chip" ||
      b.__component === "content.location" ||
      b.__component === "content.event-date-time",
  );

  return (
    <View style={styles.container}>
      {hasInfoBlocks && <InfoCard blocks={blocks} dark={dark} />}
      {blocks.map((block) => {
        switch (block.__component) {
          case "content.text":
            return <TextBlock key={`${block.__component}-${block.id}`} block={block} color={textColor} />;
          case "content.section-title":
            return <SectionTitleBlock key={`${block.__component}-${block.id}`} block={block} color={textColor} />;
          case "content.calendar":
            return <CalendarBlock key={`${block.__component}-${block.id}`} block={block} dark={dark} />;
          case "content.chip":
          case "content.location":
          case "content.event-date-time":
            return null;
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
