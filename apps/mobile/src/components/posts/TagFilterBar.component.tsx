import React from "react";
import { ScrollView, View, Pressable } from "react-native";
import Tag from "@/components/core/Tag.component";
import TextCore from "@/components/core/Text.component";
import type { Theme, ColorPalette } from "@/styles/themes/theme";
import type { Tag as PostTag } from "@repo/types";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type Props = {
  tags: PostTag[];
  selectedTagIds: number[];
  onSelect: (id: number | string) => void;
  onClear: () => void;
};

// Map Strapi color names to Theme color palette
function mapTagColor(colorName?: string): ColorPalette {
  const map: Record<string, ColorPalette> = {
    red: "red",
    rose: "red",
    amber: "amber",
    yellow: "amber",
    orange: "amber",
    green: "green",
    emerald: "green",
    lime: "green",
    teal: "teal",
    cyan: "teal",
    blue: "primary",
    sky: "primary",
    indigo: "purple",
    violet: "purple",
    purple: "purple",
    fuchsia: "pink",
    pink: "pink",
  };
  return map[colorName ?? ""] ?? "primary";
}

export function TagFilterBar({ tags, selectedTagIds, onSelect, onClear }: Props) {
  const { theme } = useUnistyles();
  const hasSelection = selectedTagIds.length > 0;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      {hasSelection && (
        <Pressable style={styles.clearPill} onPress={onClear}>
          <TextCore variant="label" color={theme.colors.dark.background.main} numberOfLines={1}>
            Clear filters
          </TextCore>
        </Pressable>
      )}

      {tags.map((tag) => {
        const tagId = tag.id as number;
        const selected = selectedTagIds.includes(tagId);
        const dimmed = hasSelection && !selected;
        return (
          <View key={tag.id} style={dimmed ? styles.dimmed : undefined}>
            <Tag
              text={`#${tag.title}`}
              color={mapTagColor(tag.color?.color)}
              onPress={tag.id != null ? () => onSelect(tagId) : undefined}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  scrollView: {
    width: "100%",
    height: 40,
    backgroundColor: "transparent",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xxs,
  },
  clearPill: {
    backgroundColor: theme.colors.dark.main,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    justifyContent: "center",
    shadowColor: theme.colors.dark.main,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 4,
  },
  dimmed: {
    opacity: 0.4,
  },
}));
