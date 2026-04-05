import { getExpoGoProjectConfig } from "expo";
import { Platform } from "react-native";

const fromEnv = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

/**
 * In Expo Go, `debuggerHost` matches the machine running Metro (same LAN IP you need for the API).
 */
function devDefault(): string {
  if (fromEnv) return fromEnv;

  const dbg = getExpoGoProjectConfig()?.debuggerHost;
  if (dbg) {
    const host = dbg.split(":")[0]?.trim();
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return `http://${host}:3000`;
    }
  }

  if (Platform.OS === "android") return "http://10.0.2.2:3000";
  return "http://localhost:3000";
}

export const API_BASE_URL = __DEV__ ? devDefault() : fromEnv || "http://localhost:3000";
