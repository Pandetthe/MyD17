import { strapiUrl } from "@/lib/apiClient";
import type { Post } from "@repo/types";

type StrapiImageFormat = { url: string; width: number; height: number };
type StrapiImageFormats = {
  thumbnail?: StrapiImageFormat;
  small?: StrapiImageFormat;
  medium?: StrapiImageFormat;
  large?: StrapiImageFormat;
};

export function getPostDescription(post: Post): string {
  return post.description ?? "";
}

function resolveFirstImage(images: unknown): { url?: string; formats?: unknown } | null {
  if (!images) return null;
  // Strapi may return an array (multiple: true) or a single object
  const item = Array.isArray(images) ? images[0] : images;
  if (!item || typeof item !== "object") return null;
  return item as { url?: string; formats?: unknown };
}

export function getPostFirstImage(post: Post): string | null {
  const image = resolveFirstImage(post.images);
  if (!image) return null;
  const formats = image.formats as StrapiImageFormats | null;
  const url = formats?.medium?.url ?? formats?.small?.url ?? (image.url as string | undefined);
  if (!url) return null;
  return strapiUrl(url);
}

export function getPostHeroImage(post: Post): string | null {
  const image = resolveFirstImage(post.images);
  if (!image) return null;
  const formats = image.formats as StrapiImageFormats | null;
  const url = formats?.large?.url ?? formats?.medium?.url ?? (image.url as string | undefined);
  if (!url) return null;
  return strapiUrl(url);
}
