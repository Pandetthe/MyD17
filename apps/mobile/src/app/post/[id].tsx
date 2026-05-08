import React from "react";
import { View, ActivityIndicator } from "react-native";
import Button from "@/components/core/Button.component";
import TextCore from "@/components/core/Text.component";
import { PostDetail } from "@/components/posts/PostDetail/PostDetail.component";
import { usePost } from "@/features/posts/api/usePost";
import type { Theme } from "@/styles/themes/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useUnistyles();
  const { data, isLoading, isError } = usePost(id ?? "");

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.centered}>
        <TextCore variant="body" color={theme.colors.primary.text.secondary}>
          Nie udało się załadować posta.
        </TextCore>
        <Button text="Wróć" color="primary" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <PostDetail post={data.data} />
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.dark.background.main,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.dark.background.main,
    gap: theme.spacing.sm,
  },
}));
