import { useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { postQueryKeys } from "./queryKeys";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Post, StrapiListResponse, StrapiSingleResponse } from "@repo/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const STORAGE_KEY = "@liked_posts";
const LIKED_QUERY_KEY = ["likedPosts"] as const;
// If the request hasn't confirmed within this window, revert the optimistic heart.
const FALLBACK_MS = process.env.NODE_ENV === "test" ? 10 : 10_000;

type InfinitePosts = { pages: StrapiListResponse<Post>[]; pageParams: unknown[] };

async function loadLikedIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as string[]) : [];
}

async function persistLikedIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function useLikePost(post: Post) {
  const queryClient = useQueryClient();
  const id = post.documentId ?? "";
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: likedIds = [] } = useQuery({
    queryKey: LIKED_QUERY_KEY,
    queryFn: loadLikedIds,
    staleTime: Infinity,
  });

  const liked = likedIds.includes(id);

  const clearFallback = () => {
    if (fallbackTimer.current) {
      clearTimeout(fallbackTimer.current);
      fallbackTimer.current = null;
    }
  };

  // Clear any pending timer if the component unmounts.
  useEffect(() => clearFallback, []);

  const revertTo = (prevIds: string[]) => {
    setOptimisticCount(null);
    queryClient.setQueryData(LIKED_QUERY_KEY, prevIds);
    void persistLikedIds(prevIds);
  };

  // Write the authoritative likes count into the list + detail caches.
  const writeCount = (likesCount: number) => {
    queryClient.setQueryData<InfinitePosts | undefined>(postQueryKeys.list(), (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.map((p) => (p.documentId === id ? { ...p, likesCount } : p)),
        })),
      };
    });
    queryClient.setQueryData<StrapiSingleResponse<Post> | undefined>(
      postQueryKeys.detail(id),
      (old) => (old?.data ? { ...old, data: { ...old.data, likesCount } } : old),
    );
  };

  const { mutate } = useMutation({
    mutationFn: (action: "like" | "unlike") =>
      apiClient.post<{ likesCount: number }>(`/api/posts/${id}/like`, { action }),
    onMutate: (action) => {
      clearFallback();
      const nowLiked = action === "like";
      const next = nowLiked
        ? [...likedIds.filter((x) => x !== id), id]
        : likedIds.filter((x) => x !== id);
      queryClient.setQueryData(LIKED_QUERY_KEY, next);
      void persistLikedIds(next);
      setOptimisticCount((post.likesCount ?? 0) + (nowLiked ? 1 : -1));

      const prevIds = likedIds;
      // Keep the heart "loaded" optimistically; only fall back if it never succeeds.
      fallbackTimer.current = setTimeout(() => revertTo(prevIds), FALLBACK_MS);
      return { prevIds };
    },
    onSuccess: (res) => {
      clearFallback();
      writeCount(res.data.likesCount);
      // Hold the server count in optimisticCount so the display stays stable until the
      // parent re-renders with the updated post prop — avoids the brief flicker that
      // occurred when delta was reset to 0 before the prop caught up.
      setOptimisticCount(res.data.likesCount);
    },
    // On error we intentionally do nothing here: the heart stays loaded and the
    // scheduled fallback reverts it after FALLBACK_MS if it never succeeds.
  });

  return {
    likePost: () => mutate(liked ? "unlike" : "like"),
    liked,
    likesCount: optimisticCount !== null ? optimisticCount : (post.likesCount ?? 0),
  };
}
