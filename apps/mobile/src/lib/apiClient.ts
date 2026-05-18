import { Platform } from "react-native";
import axios from "axios";
import * as Device from "expo-device";

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_STRAPI_URL) {
    return process.env.EXPO_PUBLIC_STRAPI_URL;
  }
  if (Platform.OS === "android" && !Device.isDevice) {
    return "http://10.0.2.2:1337";
  }
  if (__DEV__) {
    console.warn("EXPO_PUBLIC_STRAPI_URL is not set. Create apps/mobile/.env.local and set it.");
  }
  return "http://localhost:1337";
};

const BASE_URL = getBaseUrl();

export const apiClient = axios.create({ baseURL: BASE_URL });

export function strapiUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}
