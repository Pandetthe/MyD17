import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import { usePost } from "../usePost";

const mockGet = jest.fn();
jest.mock("@/lib/apiClient", () => ({
  apiClient: { get: (url: string) => mockGet(url) },
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => mockGet.mockReset());

describe("usePost", () => {
  it("fetches the post by documentId", async () => {
    const post = { documentId: "abc", title: "Hello" };
    mockGet.mockResolvedValue({ data: { data: post } });
    const { result } = renderHook(() => usePost("abc"), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("/api/posts/abc"));
  });

  it("returns the post data on success", async () => {
    const post = { documentId: "abc", title: "Hello", content: [] };
    mockGet.mockResolvedValue({ data: { data: post } });
    const { result } = renderHook(() => usePost("abc"), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(post);
  });

  it("includes populate params for content dynamic zones", async () => {
    mockGet.mockResolvedValue({ data: { data: { documentId: "abc" } } });
    const { result } = renderHook(() => usePost("abc"), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("populate[images]=true");
    expect(url).toContain("populate[content][on][content.text]=true");
    expect(url).toContain("populate[content][on][content.location]=true");
  });

  it("does not fetch when documentId is empty", () => {
    const { result } = renderHook(() => usePost(""), { wrapper: makeWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("sets isError when the request fails", async () => {
    mockGet.mockRejectedValue(new Error("not found"));
    const { result } = renderHook(() => usePost("bad-id"), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
