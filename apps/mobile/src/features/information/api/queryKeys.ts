export const informationQueryKeys = {
  all: ["information"] as const,
  page: () => [...informationQueryKeys.all, "page"] as const,
};
