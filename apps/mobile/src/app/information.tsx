import React, { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, View, Pressable } from "react-native";
import TextCore from "@/components/core/Text.component";
import { InfoBottomDrawer } from "@/components/information/InfoBottomDrawer";
import { StaticInfoCard } from "@/components/information/StaticInfoCard";
import { strapiColorToCard } from "@/lib/strapiColors";
import { useInformationPage } from "@/features/information/api/useInformationPage";
import type { StaticInformation } from "@repo/types";
import type { Theme } from "@/styles/themes/theme";
import { GraduationCap, BookOpen, ScrollText, Info } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { ICON_MAP } from "@/lib/iconMap";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

function getIcon(item: StaticInformation, index: number): LucideIcon {
  const name = item.Icon?.icon;
  if (name && ICON_MAP[name]) return ICON_MAP[name];
  const fallback: LucideIcon[] = [GraduationCap, BookOpen, ScrollText, Info];
  return fallback[index % fallback.length];
}

export default function Information() {
  const { theme } = useUnistyles();
  const { data, isLoading, isError, refetch } = useInformationPage();
  const [selectedItem, setSelectedItem] = useState<StaticInformation | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const items = (data?.staticInformation ?? []) as StaticInformation[];

  const rows: Array<{ key: string; wide: boolean; items: StaticInformation[]; startIndex: number }> = [];
  let i = 0;
  while (i < items.length) {
    const item = items[i];
    if (item.isWide) {
      rows.push({ key: item.documentId ?? String(i), wide: true, items: [item], startIndex: i });
      i++;
    } else {
      const pair: StaticInformation[] = [item];
      if (i + 1 < items.length && !items[i + 1].isWide) {
        pair.push(items[i + 1]);
        i++;
      }
      rows.push({ key: item.documentId ?? String(i), wide: false, items: pair, startIndex: i - pair.length + 1 });
      i++;
    }
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.centered]}>
        <TextCore variant="body" color={theme.colors.primary.text.secondary}>
          Nie udało się załadować informacji.
        </TextCore>
        <Pressable onPress={() => refetch()}>
          <TextCore variant="label" color={theme.colors.primary.main}>
            Spróbuj ponownie
          </TextCore>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={theme.colors.primary.main} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          {rows.map((row) =>
            row.wide ? (
              <StaticInfoCard
                key={row.key}
                title={row.items[0].title}
                icon={getIcon(row.items[0], row.startIndex)}
                color={strapiColorToCard(row.items[0].color?.color)}
                wide
                onPress={() => setSelectedItem(row.items[0])}
              />
            ) : (
              <View key={row.key} style={styles.row}>
                {row.items.map((item, j) => (
                  <StaticInfoCard
                    key={item.documentId ?? j}
                    title={item.title}
                    icon={getIcon(item, row.startIndex + j)}
                    color={strapiColorToCard(item.color?.color)}
                    onPress={() => setSelectedItem(item)}
                  />
                ))}
              </View>
            )
          )}
        </ScrollView>
      )}

      <InfoBottomDrawer
        visible={selectedItem !== null}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </View>
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
  loader: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
}));
