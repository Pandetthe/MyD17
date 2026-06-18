import { useEffect, useRef } from "react";
import { handleTokenRefresh } from "@/lib/pushNotifications";
import {
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  onTokenRefresh,
} from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

export function useNativeSetup(fontsReady: boolean): void {
  const router = useRouter();
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?._source !== "foreground") return;
        const postId = data?.postId as string | undefined;
        if (postId) router.push({ pathname: "/post/[id]", params: { id: postId } });
      },
    );
    return () => notificationListener.current?.remove();
  }, []);

  useEffect(() => {
    return onTokenRefresh(getMessaging(), handleTokenRefresh);
  }, []);

  useEffect(() => {
    return onMessage(getMessaging(), async (msg) => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: msg.notification?.title,
          body: msg.notification?.body,
          data: { ...msg.data, _source: "foreground" },
        },
        trigger: null,
      });
    });
  }, []);

  useEffect(() => {
    return onNotificationOpenedApp(getMessaging(), (msg) => {
      const postId = msg.data?.postId as string | undefined;
      if (postId) router.push({ pathname: "/post/[id]", params: { id: postId } });
    });
  }, []);

  useEffect(() => {
    if (!fontsReady) return;
    getInitialNotification(getMessaging()).then((msg) => {
      if (!msg) return;
      const postId = msg.data?.postId as string | undefined;
      if (postId)
        setTimeout(() => router.push({ pathname: "/post/[id]", params: { id: postId } }), 0);
    });
  }, [fontsReady]);
}
