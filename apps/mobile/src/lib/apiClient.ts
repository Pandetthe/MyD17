import { Platform } from "react-native";
import axios from "axios";
import * as Device from "expo-device";

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_STRAPI_URL) {
    return process.env.EXPO_PUBLIC_STRAPI_URL;
  }
  if (Platform.OS === "android" && !Device.isDevice) {
    return "http://10.0.2.2:1337"; // Android Emulator loopback
  }
  return "http://192.168.0.79:1337"; // Current PC LAN IP based on terminal context, otherwise fall back to your needs
};

const BASE_URL = getBaseUrl();

export const apiClient = axios.create({ baseURL: BASE_URL });

export function strapiUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}
