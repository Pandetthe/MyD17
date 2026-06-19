import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { ContentRenderer } from "@/components/ContentRenderer";
import { PostDetail } from "@/components/posts/PostDetail/PostDetail.component";
import { apiClient } from "@/lib/apiClient";
import { colors } from "@/styles/colors";
import type { Theme } from "@/styles/themes/theme";
import type { Post, PostContentBlock } from "@repo/types";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

type PostPreview = {
  type: "post";
  post: Post;
  heroImageUrl: string | null;
  status: "draft" | "published";
};
type DrawerPreview = {
  type: "drawer";
  title: string;
  blocks: PostContentBlock[];
  status: "draft" | "published";
};
type PreviewData = PostPreview | DrawerPreview;

function StatusBadge({ status }: { status: "draft" | "published" }) {
  const label = status === "published" ? "Opublikowany" : "Szkic";
  return (
    <View style={status === "published" ? styles.badgePublished : styles.badgeDraft}>
      <Text style={status === "published" ? styles.badgeTextPublished : styles.badgeTextDraft}>
        {label}
      </Text>
    </View>
  );
}

export default function PreviewPage() {
  const insets = useSafeAreaInsets();
  const rawParams = useLocalSearchParams();
  const uid = Array.isArray(rawParams.uid)
    ? rawParams.uid[0]
    : (rawParams.uid as string | undefined);
  const documentId = Array.isArray(rawParams.documentId)
    ? rawParams.documentId[0]
    : (rawParams.documentId as string | undefined);
  const status = Array.isArray(rawParams.status)
    ? rawParams.status[0]
    : (rawParams.status as string | undefined);
  const secret = Array.isArray(rawParams.secret)
    ? rawParams.secret[0]
    : (rawParams.secret as string | undefined);

  const [data, setData] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !documentId) {
      setError("Brakujące parametry podglądu.");
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const qs = new URLSearchParams({ uid, documentId, status: status ?? "draft" });
    // Secret is sent as a header so it does not appear in Strapi's HTTP access logs.
    apiClient
      .get<PreviewData>(`/api/preview-content?${qs.toString()}`, {
        signal: controller.signal,
        headers: { "X-Preview-Secret": secret ?? "" },
        timeout: 15000,
      })
      .then((r) => setData(r.data))
      .catch((e: unknown) => {
        if (axios.isCancel(e)) return;
        let msg: string;
        if (axios.isAxiosError(e)) {
          msg = (e.response?.data as { error?: string } | undefined)?.error ?? e.message;
        } else if (e instanceof Error) {
          msg = e.message;
        } else {
          msg = "Nieznany błąd";
        }
        setError(msg);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [uid, documentId, status, secret]);

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
          <Text style={styles.drawerTitle} numberOfLines={1}>
            {data.title}
          </Text>
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

const badgeBase = {
  paddingHorizontal: 12,
  paddingVertical: 4,
  borderRadius: 999,
  borderWidth: 1,
} as const;
const badgeTextBase = {
  fontSize: 11,
  fontWeight: "700" as const,
  letterSpacing: 0.5,
  textTransform: "uppercase" as const,
};

const styles = StyleSheet.create((theme: Theme) => ({
  badgePublished: {
    ...badgeBase,
    backgroundColor: "rgba(34,197,94,0.15)",
    borderColor: "rgba(34,197,94,0.4)",
  },
  badgeDraft: {
    ...badgeBase,
    backgroundColor: "rgba(245,158,11,0.15)",
    borderColor: "rgba(245,158,11,0.4)",
  },
  badgeTextPublished: { ...badgeTextBase, color: colors.green.main },
  badgeTextDraft: { ...badgeTextBase, color: colors.amber.main },

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
