import { informationQueryKeys } from "@/features/information/api/queryKeys";
import { apiClient } from "@/lib/apiClient";
import type { InformationPage, StrapiSingleResponse } from "@repo/types";
import { useQuery } from "@tanstack/react-query";

const URL =
  "/api/information-page?" +
  "populate[staticInformation][populate][color]=true&" +
  "populate[staticInformation][populate][Icon]=true&" +
  "populate[staticInformation][populate][content][on][content.text]=true&" +
  "populate[staticInformation][populate][content][on][content.location]=true&" +
  "populate[staticInformation][populate][content][on][content.event-date-time]=true&" +
  "populate[staticInformation][populate][content][on][content.chip]=true&" +
  "populate[staticInformation][populate][content][on][content.calendar][populate][entries]=true";

export function useInformationPage() {
  return useQuery<InformationPage, Error>({
    queryKey: informationQueryKeys.page(),
    queryFn: async () => {
      const res = await apiClient.get<StrapiSingleResponse<InformationPage>>(URL);
      return res.data.data;
    },
  });
}
