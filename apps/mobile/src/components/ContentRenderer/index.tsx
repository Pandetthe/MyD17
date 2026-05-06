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

const INFO_COMPONENTS = new Set(["content.chip", "content.location", "content.event-date-time"]);

export function ContentRenderer({ blocks, textColor, dark }: Props) {
  let infoCardRendered = false;

  return (
    <View style={styles.container}>
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
          case "content.event-date-time": {
            if (infoCardRendered) return null;
            infoCardRendered = true;
            return <InfoCard key="info-card" blocks={blocks.filter((b) => INFO_COMPONENTS.has(b.__component ?? ""))} dark={dark} />;
          }
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
