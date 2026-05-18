import { postQueryKeys } from "@/features/posts/api/queryKeys";
import { apiClient } from "@/lib/apiClient";
import type { Post, StrapiListResponse } from "@repo/types";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 10;

// Strapi v5 requires "on" fragment syntax for dynamic zones.
// Without it, component fields are not returned.
const buildPostsUrl = (page: number) =>
  "/api/posts?" +
  `pagination[page]=${page}&` +
  `pagination[pageSize]=${PAGE_SIZE}&` +
  "populate[images]=true&" +
  "populate[author][populate][avatar]=true&" +
  "populate[tags]=true&" +
  "sort=publishedAt:desc";

export function usePosts() {
  return useInfiniteQuery<StrapiListResponse<Post>, Error>({
    queryKey: postQueryKeys.list(),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await apiClient.get<StrapiListResponse<Post>>(buildPostsUrl(pageParam as number));
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pageCount } = lastPage.meta.pagination;
      return page < pageCount ? page + 1 : undefined;
    },
  });
}
