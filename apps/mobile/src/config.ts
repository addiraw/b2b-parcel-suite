import { Platform } from "react-native";

/**
 * Point this at your Next.js app (includes /api).
 * Physical device: use your computer's LAN IP, e.g. http://192.168.1.5:3000
 * Android emulator: http://10.0.2.2:3000
 */
const fromEnv = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

function devDefault(): string {
  if (fromEnv) return fromEnv;
  if (Platform.OS === "android") return "http://10.0.2.2:3000";
  return "http://localhost:3000";
}

export const API_BASE_URL = __DEV__ ? devDefault() : fromEnv || "http://localhost:3000";
