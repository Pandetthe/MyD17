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
  const narrowItems = items.filter((item) => !item.isWide);
  const wideItems = items.filter((item) => item.isWide);

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
          {narrowItems.length > 0 && (
            <View style={styles.row}>
              {narrowItems.map((item, i) => (
                <StaticInfoCard
                  key={item.documentId ?? i}
                  title={item.title}
                  icon={getIcon(i)}
                  color={tailwindToCardColor(item.color?.color)}
                  onPress={() => setSelectedItem(item)}
                />
              ))}
            </View>
          )}
          {wideItems.map((item, i) => (
            <StaticInfoCard
              key={item.documentId ?? i}
              title={item.title}
              icon={getIcon(narrowItems.length + i)}
              color={tailwindToCardColor(item.color?.color)}
              wide
              onPress={() => setSelectedItem(item)}
            />
          ))}
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
