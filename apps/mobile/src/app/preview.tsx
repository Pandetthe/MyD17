import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { ContentRenderer } from "@/components/ContentRenderer";
import { PostDetail } from "@/components/posts/PostDetail/PostDetail.component";
import { colors } from "@/styles/colors";
import type { Theme } from "@/styles/themes/theme";
import type { Post, PostContentBlock } from "@repo/types";
import { StyleSheet } from "react-native-unistyles";

type PostPreview = { type: "post"; post: Post; status: "draft" | "published" };
type DrawerPreview = { type: "drawer"; title: string; blocks: PostContentBlock[]; status: "draft" | "published" };
type PreviewData = PostPreview | DrawerPreview;

function StatusBadge({ status }: { status: "draft" | "published" }) {
  const label = status === "published" ? "Opublikowany" : "Szkic";
  return (
    <View style={status === "published" ? badgeStyles.published : badgeStyles.draft}>
      <Text style={status === "published" ? badgeStyles.textPublished : badgeStyles.textDraft}>
        {label}
      </Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  published: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(34,197,94,0.15)",
    borderColor: "rgba(34,197,94,0.4)",
  },
  draft: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(245,158,11,0.15)",
    borderColor: "rgba(245,158,11,0.4)",
  },
  textPublished: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", color: "#22C55E" },
  textDraft: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", color: "#F59E0B" },
});

export default function PreviewPage() {
  const insets = useSafeAreaInsets();
  const { uid, documentId, status, secret, strapiUrl } = useLocalSearchParams<{
    uid: string; documentId: string; status: string; secret: string; strapiUrl: string;
  }>();

  const [data, setData] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !documentId || !strapiUrl) {
      setError("Brakujące parametry podglądu.");
      setLoading(false);
      return;
    }
    const qs = new URLSearchParams({ uid, documentId, status: status ?? "draft", secret: secret ?? "" });
    fetch(`${strapiUrl}/api/preview-content?${qs.toString()}`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<PreviewData>; })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [uid, documentId, status, secret, strapiUrl]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#85B9E5" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? "Brak danych"}</Text>
      </View>
    );
  }

  // ── post ─────────────────────────────────────────────────────────────────
  if (data.type === "post") {
    return (
      <View style={styles.phoneRoot}>
        <View style={styles.phone}>
          <View style={[styles.phoneBadge, { top: (insets.top || 0) + 8 }]}>
            <StatusBadge status={data.status} />
          </View>
          <PostDetail post={data.post} preview />
        </View>
      </View>
    );
  }

  // ── drawer (static-information, contact) ─────────────────────────────────
  return (
    <View style={styles.drawerRoot}>
      <View style={styles.phone}>
        <View style={[styles.drawerBadgeRow, { paddingTop: (insets.top || 0) + 12 }]}>
          <StatusBadge status={data.status} />
          <Text style={styles.drawerTitle} numberOfLines={1}>{data.title}</Text>
        </View>
        <ScrollView
          contentContainerStyle={[
            styles.drawerScroll,
            { paddingBottom: Math.max(48, (insets.bottom || 0) + 32) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {data.blocks.length > 0 ? (
            <ContentRenderer
              blocks={data.blocks}
              textColor={colors.white}
              dark
              preview
              eventTitle={data.title}
            />
          ) : (
            <Text style={styles.emptyText}>Brak bloków treści.</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F1829",
    gap: theme.spacing.sm,
  },
  errorText: {
    color: "#F87171",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: theme.spacing.lg,
  },

  // shared phone container
  phoneRoot: {
    flex: 1,
    backgroundColor: "#0F1829",
    alignItems: "center",
    justifyContent: "center",
  },
  phone: {
    width: "100%",
    maxWidth: 390,
    flex: 1,
    overflow: "hidden",
  },
  phoneBadge: {
    position: "absolute",
    right: theme.spacing.md,
    zIndex: 10,
  },

  // drawer
  drawerRoot: {
    flex: 1,
    backgroundColor: colors.core.dark,
    alignItems: "center",
  },
  drawerBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  drawerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    flex: 1,
  },
  drawerScroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.lg,
  },
  emptyText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: theme.spacing.md,
  },
}));
