import React from "react";
import { View } from "react-native";
import type { PostContentBlock } from "@/features/posts/types/post.types";
import type { Theme } from "@/styles/themes/theme";
import { CalendarBlock } from "./CalendarBlock";
import { SectionTitleBlock } from "./SectionTitleBlock";
import { TextBlock } from "./TextBlock";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  blocks: PostContentBlock[];
};

export function ContentRenderer({ blocks }: Props) {
  return (
    <View style={styles.container}>
      {blocks.map((block) => {
        switch (block.__component) {
          case "content.text":
            return <TextBlock key={`${block.__component}-${block.id}`} block={block} />;
          case "content.section-title":
            return <SectionTitleBlock key={`${block.__component}-${block.id}`} block={block} />;
          case "content.calendar":
            return <CalendarBlock key={`${block.__component}-${block.id}`} block={block} />;
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
