import { postQueryKeys } from "@/features/posts/api/queryKeys";
import { apiClient } from "@/lib/apiClient";
import type { Post, StrapiSingleResponse } from "@repo/types";
import { useQuery } from "@tanstack/react-query";

function postUrl(documentId: string) {
  return (
    `/api/posts/${documentId}?` +
    "populate[images]=true&" +
    "populate[author][populate][avatar]=true&" +
    "populate[tags][populate][color]=true&" +
    "populate[content][on][content.text]=true&" +
    "populate[content][on][content.location]=true&" +
    "populate[content][on][content.event-date-time]=true&" +
    "populate[content][on][content.chip][populate][icon]=true&" +
    "populate[content][on][content.section-title]=true&" +
    "populate[content][on][content.calendar][populate][entries]=true"
  );
}

export function usePost(documentId: string) {
  return useQuery<StrapiSingleResponse<Post>, Error>({
    queryKey: postQueryKeys.detail(documentId),
    queryFn: async () => {
      const res = await apiClient.get<StrapiSingleResponse<Post>>(postUrl(documentId));
      return res.data;
    },
    enabled: !!documentId,
  });
}
