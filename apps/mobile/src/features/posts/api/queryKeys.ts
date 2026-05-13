export const postQueryKeys = {
  all: ["posts"] as const,
  list: () => [...postQueryKeys.all, "list"] as const,
  detail: (documentId: string) => [...postQueryKeys.all, "detail", documentId] as const,
};
