import React from "react";
import { View, useWindowDimensions } from "react-native";
import TagComponent from "@/components/core/Tag.component";
import { PostPlaceholder } from "@/lib/images";
import { tagColor } from "@/lib/tagColor";
import { colors } from "@/styles/colors";
import type { Theme } from "@/styles/themes/theme";
import type { Tag as PostTag } from "@repo/types";
import { Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  imageUrl: string | null;
  tags?: PostTag[];
};

export function HeroImage({ imageUrl, tags = [] }: Props) {
  const { width } = useWindowDimensions();
  const glowW = width * 2.8;
  const glowH = 260;

  return (
    <View style={styles.container}>
      <Image
        source={imageUrl ? { uri: imageUrl } : PostPlaceholder}
        style={styles.image}
        resizeMode="cover"
      />

      <LinearGradient
        colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0)"]}
        style={styles.topGradient}
        pointerEvents="none"
      />

      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.55)"]}
        locations={[0.4, 1]}
        style={styles.gradient}
        pointerEvents="none"
      />

      <Svg
        width={glowW}
        height={glowH}
        style={[styles.domeGlow, { left: -(glowW - width) / 2 }]}
        pointerEvents="none"
      >
        <Defs>
          <RadialGradient id="dg" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={colors.core.main} stopOpacity={0.9} />
            <Stop offset="50%" stopColor={colors.core.main} stopOpacity={0.4} />
            <Stop offset="100%" stopColor={colors.core.main} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={glowW / 2} cy={glowH / 2} rx={glowW / 2} ry={glowH / 2} fill="url(#dg)" />
      </Svg>

      <View style={styles.domeEllipse} />

      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map((tag) => (
            <TagComponent key={tag.id} text={`#${tag.title}`} color={tagColor(tag.color)} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  container: {
    height: 444,
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 444,
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 90,
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  domeEllipse: {
    position: "absolute",
    top: 390,
    left: -355,
    width: 1100,
    height: 1100,
    borderRadius: 999999,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
    shadowColor: theme.colors.primary.main,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 1,
    shadowRadius: 50,
    elevation: 12,
  },
  domeGlow: {
    position: "absolute",
    top: 260,
  },
  tagsContainer: {
    position: "absolute",
    bottom: 28,
    left: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xxs,
  },
}));
