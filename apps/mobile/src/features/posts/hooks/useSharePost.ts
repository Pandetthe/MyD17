import { Share } from "react-native";
import type { Post } from "@repo/types";

const SHARE_BASE_URL = process.env.EXPO_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

export function useSharePost(post: Post) {
  return async () => {
    const url = `${SHARE_BASE_URL}/api/share/post/${post.documentId}`;
    await Share.share({ message: url, title: post.title });
  };
}
