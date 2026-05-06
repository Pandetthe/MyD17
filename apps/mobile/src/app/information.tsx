import React, { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, View } from "react-native";
import { InfoBottomDrawer } from "@/components/information/InfoBottomDrawer";
import { StaticInfoCard, tailwindToCardColor } from "@/components/information/StaticInfoCard";
import { useInformationPage } from "@/features/information/api/useInformationPage";
import type { StaticInformation } from "@repo/types";
import type { Theme } from "@/styles/themes/theme";
import { BookOpen, GraduationCap, Info, ScrollText } from "lucide-react-native";
import { LucideIcon } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

function getIcon(index: number): LucideIcon {
  const icons: LucideIcon[] = [GraduationCap, BookOpen, ScrollText, Info];
  return icons[index % icons.length];
}

export default function Information() {
  const { theme } = useUnistyles();
  const { data, isLoading, refetch } = useInformationPage();
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
                icon={getIcon(row.startIndex)}
                color={tailwindToCardColor(row.items[0].color?.color)}
                wide
                onPress={() => setSelectedItem(row.items[0])}
              />
            ) : (
              <View key={row.key} style={styles.row}>
                {row.items.map((item, j) => (
                  <StaticInfoCard
                    key={item.documentId ?? j}
                    title={item.title}
                    icon={getIcon(row.startIndex + j)}
                    color={tailwindToCardColor(item.color?.color)}
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
