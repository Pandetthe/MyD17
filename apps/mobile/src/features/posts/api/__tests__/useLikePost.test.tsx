import React from "react";
import { useLikePost } from "../useLikePost";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Post } from "@repo/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act, waitFor } from "@testing-library/react-native";

const mockApiPost = jest.fn();

jest.mock("@/lib/apiClient", () => ({
  apiClient: { post: (url: string, body?: unknown) => mockApiPost(url, body) },
}));

const makePost = (overrides: Partial<Post> = {}): Post =>
  ({ documentId: "post-1", likesCount: 10, ...overrides }) as unknown as Post;

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, Wrapper };
}

beforeEach(() => {
  mockApiPost.mockReset();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
});

describe("useLikePost", () => {
  it("liked is false by default when AsyncStorage has no stored IDs", async () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useLikePost(makePost()), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.liked).toBe(false));
  });

  it("likesCount reflects post.likesCount when delta is 0", async () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useLikePost(makePost({ likesCount: 42 })), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.likesCount).toBe(42));
  });

  it("liked is true when post ID is already in AsyncStorage", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(["post-1"]));
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useLikePost(makePost()), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.liked).toBe(true));
  });

  it("likePost() sends 'like' action to the API when not yet liked", async () => {
    mockApiPost.mockResolvedValue({ data: { likesCount: 11 } });
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useLikePost(makePost()), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.liked).toBe(false));

    act(() => {
      result.current.likePost();
    });

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith("/api/posts/post-1/like", { action: "like" }),
    );
  });

  it("likePost() sends 'unlike' action when already liked", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(["post-1"]));
    mockApiPost.mockResolvedValue({ data: { likesCount: 9 } });
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useLikePost(makePost()), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.liked).toBe(true));

    act(() => {
      result.current.likePost();
    });

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith("/api/posts/post-1/like", { action: "unlike" }),
    );
  });

  it("applies optimistic delta of +1 immediately after likePost() on an unliked post", async () => {
    mockApiPost.mockReturnValue(new Promise(() => {})); // never resolves
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useLikePost(makePost({ likesCount: 10 })), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.liked).toBe(false));

    act(() => {
      result.current.likePost();
    });

    await waitFor(() => expect(result.current.likesCount).toBe(11));
  });

  it("reverts liked state and delta on API error", async () => {
    mockApiPost.mockRejectedValue(new Error("network error"));
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useLikePost(makePost({ likesCount: 10 })), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.liked).toBe(false));

    act(() => {
      result.current.likePost();
    });

    await waitFor(() => {
      expect(result.current.liked).toBe(false);
      expect(result.current.likesCount).toBe(10);
    });
  });

  it("delta sticks after success and resets 10s later", async () => {
    jest.useFakeTimers();
    mockApiPost.mockResolvedValue({ data: { likesCount: 15 } });
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useLikePost(makePost({ likesCount: 10 })), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.liked).toBe(false));

    act(() => {
      result.current.likePost();
    });

    await waitFor(() => expect(result.current.likesCount).toBe(11));

    act(() => {
      jest.advanceTimersByTime(10_000);
    });

    await waitFor(() => expect(result.current.likesCount).toBe(10));
    jest.useRealTimers();
  });
});
