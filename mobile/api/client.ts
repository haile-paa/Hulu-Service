import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearSession } from "../utils/session";

// Point this at your deployed Go backend (e.g. Render URL), same pattern as Yova.
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://hulu-service.onrender.com/api";

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

// The Go backend can take a few seconds to spin up (cold start / dev server
// still booting), during which requests fail with a connection error or
// timeout rather than a real HTTP response. Retry those silently a few
// times before giving up, so the UI doesn't flash an error just because the
// backend wasn't ready yet.
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1s, 2s, 3s between attempts

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Handle expected 401s (expired session) silently, matching your Yova preference,
// and auto-retry requests that never reached the backend at all.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const config = error?.config;
    // No `response` means the request never got a reply from the server —
    // connection refused, timed out, DNS failure, etc. (as opposed to a
    // real HTTP error like 400/401/500, which we don't want to retry).
    const isUnreachable = !error?.response;

    if (config && isUnreachable) {
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount < MAX_RETRIES) {
        config.__retryCount += 1;
        await sleep(RETRY_DELAY_MS * config.__retryCount);
        return api(config);
      }
    }

    if (error?.response?.status === 401) {
      await clearSession();
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
