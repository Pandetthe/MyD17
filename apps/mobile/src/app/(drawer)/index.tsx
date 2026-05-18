import React, { useState, useCallback, useMemo } from "react";
import { View, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import Button from "@/components/core/Button.component";
import TextCore from "@/components/core/Text.component";
import { PostCard } from "@/components/posts/PostCard.component";
import { TagFilterBar } from "@/components/posts/TagFilterBar.component";
import { usePosts } from "@/features/posts/api/usePosts";
import type { Theme } from "@/styles/themes/theme";
import type { Tag } from "@repo/types";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export default function PostsScreen() {
  const router = useRouter();
  const { theme } = useUnistyles();
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePosts();

  const posts = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const allTags = useMemo(
    () =>
      Array.from(
        new Map(posts.flatMap((p) => (p.tags ?? []) as Tag[]).map((t) => [t.id, t])).values(),
      ),
    [posts],
  );

  const filteredPosts = useMemo(
    () =>
      selectedTagIds.length === 0
        ? posts
        : posts.filter((p) => (p.tags ?? []).some((t) => selectedTagIds.includes(t.id as number))),
    [posts, selectedTagIds],
  );

  function handleTagToggle(id: number | string) {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    setSelectedTagIds((prev) =>
      prev.includes(numericId) ? prev.filter((x) => x !== numericId) : [...prev, numericId],
    );
  }

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <View style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.centered}>
          <TextCore variant="body" color={theme.colors.primary.subtext}>
            Nie udało się załadować postów.
          </TextCore>
          <Button text="Spróbuj ponownie" color="primary" onPress={() => refetch()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <StatusBar style="dark" />
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.documentId as string}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() =>
              router.push({
                pathname: "/post/[id]",
                params: { id: item.documentId as string },
              })
            }
            onTagPress={(id) => handleTagToggle(id)}
          />
        )}
        contentContainerStyle={styles.feed}
        ListHeaderComponent={<View style={styles.barSpacer} />}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary.main}
            colors={[theme.colors.primary.main]}
          />
        }
        ListEmptyComponent={
          <TextCore variant="body" color={theme.colors.primary.subtext} style={styles.emptyText}>
            Brak postów pasujących do wybranych filtrów.
          </TextCore>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary.main}
              style={styles.footerLoader}
            />
          ) : null
        }
      />

      <LinearGradient
        colors={[theme.colors.surface, theme.colors.surface + "00"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.barGradient}
        pointerEvents="box-none"
      >
        <TagFilterBar
          tags={allTags}
          selectedTagIds={selectedTagIds}
          onSelect={handleTagToggle}
          onClear={() => setSelectedTagIds([])}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  feed: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl * 3,
  },
  barSpacer: {
    height: theme.spacing.xl,
  },
  barGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: theme.spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  emptyText: {
    textAlign: "left",
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  footerLoader: {
    paddingVertical: theme.spacing.md,
  },
}));
