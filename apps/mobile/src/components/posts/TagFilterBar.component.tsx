import React from "react";
import { ScrollView, View, Pressable } from "react-native";
import Tag from "@/components/core/Tag.component";
import TextCore from "@/components/core/Text.component";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { tagColor } from "@/lib/tagColor";
import { colors } from "@/styles/colors";
import type { Theme } from "@/styles/themes/theme";
import type { Tag as PostTag } from "@repo/types";
import { LinearGradient } from "expo-linear-gradient";
import Animated from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

function ClearPill({ onPress }: { onPress: () => void }) {
  const { animStyle, onPressIn, onPressOut } = usePressAnimation(0.95);
  return (
    <Pressable
      testID="tag-filter-clear"
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={[styles.clearPill, animStyle]}>
        <TextCore
          variant="label"
          color={colors.white}
          numberOfLines={1}
          style={styles.clearPillText}
        >
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
  const { theme } = useUnistyles();
  const hasSelection = selectedTagIds.length > 0;
  const surface = theme.colors.surface;

  return (
    <View testID="tag-filter-bar" style={styles.wrapper}>
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
                color={tagColor(tag.color)}
                onPress={tag.id != null ? () => onSelect(tagId) : undefined}
              />
            </View>
          );
        })}
      </ScrollView>

      <LinearGradient
        colors={[surface + "00", surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.fadeRight}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  wrapper: {
    width: "100%",
    height: theme.spacing.xl * 2,
  },
  scrollView: {
    width: "100%",
    backgroundColor: "transparent",
  },
  fadeRight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    height: "100%",
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    borderWidth: 1,
    borderColor: "transparent",
    justifyContent: "center",
    shadowColor: theme.colors.dark.main,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 4,
  },
  clearPillText: {
    fontSize: 14,
    lineHeight: 18,
  },
  dimmed: {
    opacity: 0.4,
  },
}));
