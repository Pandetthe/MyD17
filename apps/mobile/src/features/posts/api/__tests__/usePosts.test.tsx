import React from "react";
import { usePosts } from "../usePosts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act, waitFor } from "@testing-library/react-native";

const mockGet = jest.fn();
jest.mock("@/lib/apiClient", () => ({
  apiClient: { get: (url: string) => mockGet(url) },
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
}

const makePage = (page: number, pageCount: number, data: unknown[] = []) => ({
  data,
  meta: { pagination: { page, pageCount, total: pageCount * 10, pageSize: 10 } },
});

beforeEach(() => mockGet.mockReset());

describe("usePosts", () => {
  it("fetches page 1 on mount", async () => {
    mockGet.mockResolvedValue({ data: makePage(1, 1) });
    const { result } = renderHook(() => usePosts(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("pagination[page]=1"));
  });

  it("includes required populate params", async () => {
    mockGet.mockResolvedValue({ data: makePage(1, 1) });
    const { result } = renderHook(() => usePosts(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("populate[images]=true");
    expect(url).toContain("populate[tags]=true");
    expect(url).toContain("sort=publishedAt:desc");
  });

  it("returns first page items on success", async () => {
    const posts = [{ documentId: "a" }, { documentId: "b" }];
    mockGet.mockResolvedValue({ data: makePage(1, 1, posts) });
    const { result } = renderHook(() => usePosts(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].data).toEqual(posts);
  });

  it("hasNextPage is true when page < pageCount", async () => {
    mockGet.mockResolvedValue({ data: makePage(1, 3) });
    const { result } = renderHook(() => usePosts(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
  });

  it("hasNextPage is false on the last page", async () => {
    mockGet.mockResolvedValue({ data: makePage(2, 2) });
    const { result } = renderHook(() => usePosts(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it("fetchNextPage fetches page 2 using the next page param", async () => {
    mockGet
      .mockResolvedValueOnce({ data: makePage(1, 2, [{ documentId: "a" }]) })
      .mockResolvedValueOnce({ data: makePage(2, 2, [{ documentId: "b" }]) });

    const { result } = renderHook(() => usePosts(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    act(() => {
      result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("pagination[page]=2"));
  });

  it("sets isError when the request fails", async () => {
    mockGet.mockRejectedValue(new Error("network error"));
    const { result } = renderHook(() => usePosts(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
