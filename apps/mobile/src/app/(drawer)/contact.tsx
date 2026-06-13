import React, { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, View } from "react-native";
import Button from "@/components/core/Button.component";
import TextCore from "@/components/core/Text.component";
import { ContentRenderer } from "@/components/ContentRenderer";
import { useContactPage } from "@/features/contact/api/useContactPage";
import type { Theme } from "@/styles/themes/theme";
import type { PostContentBlock } from "@repo/types";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export default function Contact() {
  const { theme } = useUnistyles();
  const { data, isLoading, isError, refetch } = useContactPage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  if (isError) {
    return (
      <View style={[styles.container, styles.centered]}>
        <TextCore variant="body" color={theme.colors.primary.subtext}>
          Nie udało się załadować danych kontaktowych.
        </TextCore>
        <Button text="Spróbuj ponownie" color="primary" onPress={() => refetch()} />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  const blocks = (data?.content ?? []) as PostContentBlock[];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
    >
      <ContentRenderer blocks={blocks} textColor={theme.colors.primary.text} />
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
}));
