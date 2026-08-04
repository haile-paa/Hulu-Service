import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  colorScheme: "light" | "dark";
  themeParams: Record<string, string | undefined>;
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
  };
  MainButton: {
    text: string;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
    setText: (text: string) => void;
  };
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  onEvent: (event: string, cb: () => void) => void;
  offEvent: (event: string, cb: () => void) => void;
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

export function getTelegram(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null;
}

export function initTelegram() {
  const tg = getTelegram();
  if (!tg) return; // running in a normal browser (local dev outside Telegram)

  tg.ready();
  tg.expand();

  // Only follow Telegram's light/dark MODE — our own palette (tokens.css)
  // defines the actual colors for each mode. Copying Telegram's raw hex
  // values directly (the old approach) flattened everything to one shade
  // of black in dark mode.
  document.documentElement.dataset.theme = tg.colorScheme;
  tg.onEvent("themeChanged", () => {
    document.documentElement.dataset.theme = tg.colorScheme;
  });
}

export function getTelegramUser() {
  return getTelegram()?.initDataUnsafe.user ?? null;
}

/**
 * Shows Telegram's native header back-arrow on any route that isn't a
 * bottom-nav root screen, and wires it to go back one step. This is the
 * standard Mini App pattern — the arrow lives in Telegram's own header
 * chrome, not something we draw ourselves.
 */
const ROOT_PATHS = ["/", "/bookings", "/profile", "/login", "/register"];

export function useTelegramBackButton() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const tg = getTelegram();
    if (!tg) return;

    const isRoot = ROOT_PATHS.includes(location.pathname);
    const handler = () => navigate(-1);

    if (isRoot) {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
      tg.BackButton.onClick(handler);
    }

    return () => {
      tg.BackButton.offClick(handler);
    };
  }, [location.pathname, navigate]);
}
