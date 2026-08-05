import AsyncStorage from "@react-native-async-storage/async-storage";

// A logged-in session stays valid for 48 hours after it was saved (login
// or register). If the user doesn't come back within that window, the
// stored token is discarded and they're sent back to the Login screen.
export const SESSION_TTL_MS = 48 * 60 * 60 * 1000;

const TOKEN_KEY = "@hulu_token";
const USER_KEY = "@hulu_user";
const SAVED_AT_KEY = "@hulu_session_saved_at";

export interface StoredUser {
  role: "customer" | "provider";
  [key: string]: any;
}

// Call right after a successful login/register.
export async function saveSession(token: string, user: StoredUser) {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)],
    [SAVED_AT_KEY, String(Date.now())],
  ]);
}

// Wipes the stored session — used on logout, on a 401 from the API, and
// whenever a stored session is found to be older than 48 hours.
export async function clearSession() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, SAVED_AT_KEY]);
}

// Reads back the stored session, but only if it's still within the
// 48-hour window. If it has expired, it's cleared automatically and
// null is returned. Call this on app startup to decide whether to skip
// straight past the Login screen.
export async function getValidSession(): Promise<{
  token: string;
  user: StoredUser;
} | null> {
  const entries = await AsyncStorage.multiGet([
    TOKEN_KEY,
    USER_KEY,
    SAVED_AT_KEY,
  ]);
  const values: Record<string, string | null> = {};
  entries.forEach(([key, value]) => {
    values[key] = value;
  });

  const token = values[TOKEN_KEY];
  const userRaw = values[USER_KEY];
  const savedAtRaw = values[SAVED_AT_KEY];

  if (!token || !userRaw || !savedAtRaw) {
    return null;
  }

  const savedAt = Number(savedAtRaw);
  if (!savedAt || Date.now() - savedAt > SESSION_TTL_MS) {
    await clearSession();
    return null;
  }

  try {
    return { token, user: JSON.parse(userRaw) };
  } catch {
    await clearSession();
    return null;
  }
}
