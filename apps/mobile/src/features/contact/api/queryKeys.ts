export const contactQueryKeys = {
  all: ["contact"] as const,
  page: () => [...contactQueryKeys.all, "page"] as const,
};
