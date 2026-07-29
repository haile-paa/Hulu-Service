import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Point this at your deployed Go backend (e.g. Render URL), same pattern as Yova.
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.3:8080/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("@hulu_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expected 401s (expired session) silently, matching your Yova preference.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error?.response?.status === 401) {
      await AsyncStorage.removeItem("@hulu_token");
      // Navigation to Login on 401 is wired up where the auth context listens for this.
    }
    return Promise.reject(error);
  },
);

// WebSocket connections can't carry a custom Authorization header on the
// handshake, so the chat socket takes the JWT as a query param instead.
// This turns "http://host:port/api" into "ws://host:port/api" (or
// "https://" into "wss://") and appends the booking id + token.
export async function buildChatSocketUrl(bookingId: string) {
  const token = await AsyncStorage.getItem("@hulu_token");
  const wsBase = BASE_URL.replace(/^http/, "ws");
  return `${wsBase}/ws/chat/${bookingId}?token=${encodeURIComponent(token || "")}`;
}
