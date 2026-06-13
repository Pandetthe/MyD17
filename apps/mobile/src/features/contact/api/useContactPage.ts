import { contactQueryKeys } from "@/features/contact/api/queryKeys";
import { apiClient } from "@/lib/apiClient";
import type { ContactPage, StrapiSingleResponse } from "@repo/types";
import { useQuery } from "@tanstack/react-query";

const URL =
  "/api/contact?" +
  "populate[content][on][content.text]=true&" +
  "populate[content][on][content.section-title]=true&" +
  "populate[content][on][content.location]=true&" +
  "populate[content][on][content.event-date-time]=true&" +
  "populate[content][on][content.chip]=true&" +
  "populate[content][on][content.calendar][populate][entries]=true";

export function useContactPage() {
  return useQuery<ContactPage, Error>({
    queryKey: contactQueryKeys.page(),
    queryFn: async () => {
      const res = await apiClient.get<StrapiSingleResponse<ContactPage>>(URL);
      return res.data.data;
    },
  });
}
