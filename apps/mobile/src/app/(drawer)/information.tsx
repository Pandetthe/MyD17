import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, View } from "react-native";
import Button from "@/components/core/Button.component";
import TextCore from "@/components/core/Text.component";
import { InfoBottomDrawer } from "@/components/information/InfoBottomDrawer";
import { StaticInfoCard } from "@/components/information/StaticInfoCard";
import { useInformationPage } from "@/features/information/api/useInformationPage";
import { getIcon } from "@/lib/iconMap";
import { tagColor } from "@/lib/tagColor";
import type { Theme } from "@/styles/themes/theme";
import type { StaticInformation } from "@repo/types";
import { useFocusEffect } from "expo-router";
import { GraduationCap, BookOpen, ScrollText, Info } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

const ICON_FALLBACKS: LucideIcon[] = [GraduationCap, BookOpen, ScrollText, Info];

function buildRows(items: StaticInformation[]) {
  const rows: Array<{
    key: string;
    wide: boolean;
    items: StaticInformation[];
    startIndex: number;
  }> = [];
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
      rows.push({
        key: item.documentId ?? String(i),
        wide: false,
        items: pair,
        startIndex: i - pair.length + 1,
      });
      i++;
    }
  }
  return rows;
}

function resolveIcon(item: StaticInformation, index: number): LucideIcon {
  return getIcon(item.icon, ICON_FALLBACKS[index % ICON_FALLBACKS.length]);
}

export default function Information() {
  const { theme } = useUnistyles();
  const { data, isLoading, isError, refetch } = useInformationPage();
  const [selectedItem, setSelectedItem] = useState<StaticInformation | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      return () => setSelectedItem(null);
    }, []),
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const items = useMemo(() => (data?.staticInformation ?? []) as StaticInformation[], [data]);
  const rows = useMemo(() => buildRows(items), [items]);

  if (isError) {
    return (
      <View testID="information-error" style={[styles.container, styles.centered]}>
        <TextCore variant="body" color={theme.colors.primary.subtext}>
          Nie udało się załadować informacji.
        </TextCore>
        <Button text="Spróbuj ponownie" color="primary" onPress={() => refetch()} />
      </View>
    );
  }

  const isEmpty = !isLoading && items.length === 0;

  const renderContent = () => {
    if (isLoading) {
      return (
        <ActivityIndicator
          testID="information-loading"
          style={styles.loader}
          color={theme.colors.primary.main}
        />
      );
    }

    if (isEmpty) {
      return (
        <View testID="information-empty" style={[styles.container, styles.centered]}>
          <TextCore variant="body" color={theme.colors.primary.subtext}>
            Brak dostępnych informacji.
          </TextCore>
          <Button text="Odśwież" color="primary" onPress={() => refetch()} />
        </View>
      );
    }

    return (
      <ScrollView
        testID="information-scroll"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {rows.map((row) =>
          row.wide ? (
            <StaticInfoCard
              key={row.key}
              title={row.items[0].title}
              icon={resolveIcon(row.items[0], row.startIndex)}
              color={tagColor(row.items[0].color)}
              wide
              onPress={() => setSelectedItem(row.items[0])}
            />
          ) : (
            <View key={row.key} style={styles.row}>
              {row.items.map((item, j) => (
                <StaticInfoCard
                  key={item.documentId ?? j}
                  title={item.title}
                  icon={resolveIcon(item, row.startIndex + j)}
                  color={tagColor(item.color)}
                  onPress={() => setSelectedItem(item)}
                />
              ))}
            </View>
          ),
        )}
      </ScrollView>
    );
  };

  return (
    <View testID="information-screen" style={styles.container}>
      {renderContent()}

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
