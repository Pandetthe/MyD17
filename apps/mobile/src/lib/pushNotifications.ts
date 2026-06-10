import { Platform } from "react-native";
import { apiClient } from "./apiClient";
import { FCM_TOKEN_KEY } from "./storageKeys";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMessaging, getToken, deleteToken } from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return null;
  try {
    await deleteToken(getMessaging());
  } catch (err) {
    console.warn("Failed to delete stale FCM token:", err);
  }

  const token = await getToken(getMessaging());
  console.log("FCM token:", token);
  return token;
}

type SubscriberResponse = {
  data: Array<{ documentId: string }>;
};

export async function syncSubscriptions(tagIds: number[]) {
  const token = await registerForPushNotifications();
  if (!token) return;

  const storedToken = await AsyncStorage.getItem(FCM_TOKEN_KEY).catch(() => null);
  const lookupToken = storedToken ?? token;

  const existing = await apiClient
    .get<SubscriberResponse>(
      `/api/push-subscribers?filters[pushToken][$eq]=${encodeURIComponent(lookupToken)}&fields[0]=documentId`,
    )
    .then((r) => r.data.data[0] ?? null)
    .catch(() => null);

  if (existing) {
    await apiClient.put(`/api/push-subscribers/${existing.documentId}`, {
      data: { pushToken: token, tags: tagIds },
    });
  } else {
    await apiClient.post("/api/push-subscribers", {
      data: { pushToken: token, tags: tagIds },
    });
  }

  await AsyncStorage.setItem(FCM_TOKEN_KEY, token).catch(() => null);
}

export async function handleTokenRefresh(newToken: string) {
  const storedToken = await AsyncStorage.getItem(FCM_TOKEN_KEY).catch(() => null);
  if (!storedToken) return;

  const existing = await apiClient
    .get<SubscriberResponse>(
      `/api/push-subscribers?filters[pushToken][$eq]=${encodeURIComponent(storedToken)}&fields[0]=documentId`,
    )
    .then((r) => r.data.data[0] ?? null)
    .catch(() => null);

  if (existing) {
    await apiClient.put(`/api/push-subscribers/${existing.documentId}`, {
      data: { pushToken: newToken },
    });
  }

  await AsyncStorage.setItem(FCM_TOKEN_KEY, newToken).catch(() => null);
}
