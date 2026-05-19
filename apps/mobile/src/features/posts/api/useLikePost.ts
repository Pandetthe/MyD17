import { useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { postQueryKeys } from "./queryKeys";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Post, StrapiSingleResponse } from "@repo/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const STORAGE_KEY = "@liked_posts";
const LIKED_QUERY_KEY = ["likedPosts"] as const;

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
  const [delta, setDelta] = useState(0);
  const baseCountRef = useRef(post.likesCount ?? 0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current !== null) clearTimeout(timerRef.current); }, []);

  type LikePostResponse = {
    likesCount: number;
  };

  type LikePostContext = {
    prevIds: string[];
  };

  const { data: likedIds = [] } = useQuery({
    queryKey: LIKED_QUERY_KEY,
    queryFn: loadLikedIds,
    staleTime: Infinity,
  });

  const liked = likedIds.includes(id);

  const { mutate } = useMutation<LikePostResponse, Error, "like" | "unlike", LikePostContext>({
    mutationFn: async (action) => {
      const response = await apiClient.post<LikePostResponse>(`/api/posts/${id}/like`, { action });
      return response.data;
    },
    onMutate: (action) => {
      const nowLiked = action === "like";
      const next = nowLiked
        ? [...likedIds.filter((x) => x !== id), id]
        : likedIds.filter((x) => x !== id);
      queryClient.setQueryData(LIKED_QUERY_KEY, next);
      void persistLikedIds(next);
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      baseCountRef.current = post.likesCount ?? 0;
      setDelta(nowLiked ? 1 : -1);
      return { prevIds: likedIds };
    },
    onSuccess: (response) => {
      timerRef.current = setTimeout(() => {
        setDelta(0);
        timerRef.current = null;
      }, 10_000);
      queryClient.setQueryData(
        postQueryKeys.detail(id),
        (old?: StrapiSingleResponse<Post> | null) => {
          if (!old?.data) return old;
          return { ...old, data: { ...old.data, likesCount: response.likesCount } };
        },
      );
      queryClient.invalidateQueries({ queryKey: postQueryKeys.list() });
    },
    onError: (_, _action, context) => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setDelta(0);
      if (context?.prevIds) {
        queryClient.setQueryData(LIKED_QUERY_KEY, context.prevIds);
        void persistLikedIds(context.prevIds);
      }
    },
  });

  return {
    likePost: () => mutate(liked ? "unlike" : "like"),
    liked,
    likesCount: delta !== 0 ? baseCountRef.current + delta : (post.likesCount ?? 0),
  };
}
