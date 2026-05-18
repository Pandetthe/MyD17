import React from "react";
import { ScrollView, View, Pressable } from "react-native";
import Tag from "@/components/core/Tag.component";
import { colors } from "@/styles/colors";
import TextCore from "@/components/core/Text.component";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { strapiColorToPalette } from "@/lib/strapiColors";
import type { Theme } from "@/styles/themes/theme";
import type { Tag as PostTag } from "@repo/types";
import Animated from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

function ClearPill({ onPress }: { onPress: () => void }) {
  const { theme } = useUnistyles();
  const { animStyle, onPressIn, onPressOut } = usePressAnimation(0.95);
  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.clearPill, animStyle]}>
        <TextCore variant="label" color={colors.white} numberOfLines={1}>
          Wyczyść
        </TextCore>
      </Animated.View>
    </Pressable>
  );
}

type Props = {
  tags: PostTag[];
  selectedTagIds: number[];
  onSelect: (id: number | string) => void;
  onClear: () => void;
};

export function TagFilterBar({ tags, selectedTagIds, onSelect, onClear }: Props) {
  const hasSelection = selectedTagIds.length > 0;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      {hasSelection && <ClearPill onPress={onClear} />}

      {tags.map((tag) => {
        const tagId = tag.id as number;
        const selected = selectedTagIds.includes(tagId);
        const dimmed = hasSelection && !selected;
        return (
          <View key={tag.id} style={dimmed ? styles.dimmed : undefined}>
            <Tag
              text={`#${tag.title}`}
              color={strapiColorToPalette(tag.color)}
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
