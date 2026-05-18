import React from "react";
import { View } from "react-native";
import Button from "@/components/core/Button.component";
import TagComponent from "@/components/core/Tag.component";
import { PostPlaceholder } from "@/lib/images";
import { strapiColorToPalette } from "@/lib/strapiColors";
import type { Theme } from "@/styles/themes/theme";
import type { Tag as PostTag } from "@repo/types";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  imageUrl: string | null;
  onBack: () => void;
  tags?: PostTag[];
};

export function HeroImage({ imageUrl, onBack, tags = [] }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        source={imageUrl ? { uri: imageUrl } : PostPlaceholder}
        style={styles.image}
        contentFit="cover"
      />

      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.55)"]}
        locations={[0.4, 1]}
        style={styles.gradient}
        pointerEvents="none"
      />

      <View style={styles.domeEllipse} />

      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map((tag) => (
            <TagComponent
              key={tag.id}
              text={`#${tag.title}`}
              color={strapiColorToPalette(tag.color)}
            />
          ))}
        </View>
      )}

      <Button
        icon={ArrowLeft}
        color="dark"
        size="lg"
        style={[styles.backButton, { top: insets.top }]}
        onPress={onBack}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  container: {
    height: 444,
    position: "relative",
  },
  image: {
    width: "100%",
    height: 444,
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
    top: 380,
    left: -250,
    width: 900,
    height: 900,
    borderRadius: 999999,
    backgroundColor: theme.colors.surface,
    borderWidth: 6,
    borderColor: theme.colors.primary.main,
    shadowColor: theme.colors.primary.main,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
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
  backButton: {
    position: "absolute",
    left: theme.spacing.md,
  },
}));
