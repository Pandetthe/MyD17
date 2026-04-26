import { type PropsWithChildren, useEffect } from "react";
import { AppState, type AppStateStatus, Platform } from "react-native";
import { queryClient } from "@/lib/queryClient";
import { focusManager, onlineManager, QueryClientProvider } from "@tanstack/react-query";
import * as Network from "expo-network";

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

export function QueryProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);

    onlineManager.setEventListener((setOnline) => {
      const eventListener = Network.addNetworkStateListener((state) => {
        setOnline(!!state.isConnected);
      });
      return eventListener.remove;
    });

    return () => subscription.remove();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
