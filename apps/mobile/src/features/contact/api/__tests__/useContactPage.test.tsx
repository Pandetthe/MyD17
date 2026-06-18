import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import { useContactPage } from "../useContactPage";

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

describe("useContactPage", () => {
  it("fetches the contact page on mount", async () => {
    mockGet.mockResolvedValue({ data: { data: { id: 1 } } });
    const { result } = renderHook(() => useContactPage(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("/api/contact"));
  });

  it("returns the unwrapped data (res.data.data)", async () => {
    const page = { id: 1, content: [] };
    mockGet.mockResolvedValue({ data: { data: page } });
    const { result } = renderHook(() => useContactPage(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(page);
  });

  it("includes content populate params", async () => {
    mockGet.mockResolvedValue({ data: { data: {} } });
    const { result } = renderHook(() => useContactPage(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("populate[content][on][content.text]=true");
    expect(url).toContain("populate[content][on][content.chip]=true");
  });

  it("sets isError when the request fails", async () => {
    mockGet.mockRejectedValue(new Error("server error"));
    const { result } = renderHook(() => useContactPage(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
