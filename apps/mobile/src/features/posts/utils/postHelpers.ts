/* eslint-disable @typescript-eslint/no-explicit-any */
import { strapiUrl } from "@/lib/apiClient";
import type { Post } from "../types/post.types";

export function getPostDescription(post: Post): string {
  return post.description ?? "";
}

export function getPostFirstImage(post: Post): string | null {
  const image = (post.images ?? [])[0];
  if (!image) return null;
  const formats = image.formats as Record<string, any>;
  const url = formats?.medium?.url ?? image.url;
  return strapiUrl(url);
}

export function getPostHeroImage(post: Post): string | null {
  const image = (post.images ?? [])[0];
  if (!image) return null;
  const formats = image.formats as Record<string, any>;
  const url = formats?.large?.url ?? image.url;
  return strapiUrl(url);
}
