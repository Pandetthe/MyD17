import { useState } from "react";
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
      setDelta(nowLiked ? 1 : -1);
      return { prevIds: likedIds };
    },
    onSuccess: (response) => {
      setDelta(0);
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
    likesCount: (post.likesCount ?? 0) + delta,
  };
}
