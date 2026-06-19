const mockGet = jest.fn();
const mockPut = jest.fn();
const mockPost = jest.fn();

jest.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: (url: string) => mockGet(url),
    put: (url: string, data: unknown) => mockPut(url, data),
    post: (url: string, data: unknown) => mockPost(url, data),
  },
}));

jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  AndroidImportance: { MAX: 5 },
}));

jest.mock("@react-native-firebase/messaging", () => ({
  getMessaging: jest.fn(() => ({})),
  getToken: jest.fn().mockResolvedValue("new-fcm-token"),
  deleteToken: jest.fn().mockResolvedValue(undefined),
}));

import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleTokenRefresh } from "../pushNotifications";

const FCM_TOKEN_KEY = "fcm_token";

beforeEach(() => {
  mockGet.mockReset();
  mockPut.mockReset();
  mockPost.mockReset();
  (AsyncStorage.getItem as jest.Mock).mockReset();
  (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
});

describe("handleTokenRefresh", () => {
  it("does nothing when there is no stored token", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    await handleTokenRefresh("new-token");
    expect(mockPut).not.toHaveBeenCalled();
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("updates the subscriber record and storage when subscriber is found", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("old-token");
    mockGet.mockResolvedValue({ data: { data: [{ documentId: "sub-123" }] } });
    mockPut.mockResolvedValue({});

    await handleTokenRefresh("brand-new-token");

    expect(mockPut).toHaveBeenCalledWith("/api/push-subscribers/sub-123", {
      data: { pushToken: "brand-new-token" },
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(FCM_TOKEN_KEY, "brand-new-token");
  });

  it("skips PUT but still updates storage when no subscriber is found", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("old-token");
    mockGet.mockResolvedValue({ data: { data: [] } });

    await handleTokenRefresh("brand-new-token");

    expect(mockPut).not.toHaveBeenCalled();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(FCM_TOKEN_KEY, "brand-new-token");
  });

  it("gracefully continues when the GET request rejects", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("old-token");
    mockGet.mockRejectedValue(new Error("network error"));

    await expect(handleTokenRefresh("brand-new-token")).resolves.toBeUndefined();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(FCM_TOKEN_KEY, "brand-new-token");
  });

  it("uses the stored token (not newToken) as the lookup filter", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("stored-old-token");
    mockGet.mockResolvedValue({ data: { data: [] } });

    await handleTokenRefresh("brand-new-token");

    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent("stored-old-token")),
    );
  });
});
