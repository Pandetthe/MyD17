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

export function getPostFirstImage(post: Post): string | null {
  const image = (post.images ?? [])[0];
  if (!image) return null;
  const formats = image.formats as StrapiImageFormats | null;
  const url = formats?.medium?.url ?? image.url;
  return strapiUrl(url);
}

export function getPostHeroImage(post: Post): string | null {
  const image = (post.images ?? [])[0];
  if (!image) return null;
  const formats = image.formats as StrapiImageFormats | null;
  const url = formats?.large?.url ?? image.url;
  return strapiUrl(url);
}
