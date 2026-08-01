// Minimal typing for the pieces of the Telegram WebApp JS SDK we use.
// The real SDK is loaded via <script> in index.html and attaches itself to
// window.Telegram.WebApp.
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

// Maps Telegram's theme param names onto our own CSS variable names, so the
// mini app visually matches whatever theme (light/dark, custom accent) the
// user already has set in their Telegram client.
const THEME_MAP: Record<string, string> = {
  bg_color: "--bg",
  secondary_bg_color: "--bg-elevated",
  section_bg_color: "--bg-elevated-2",
  text_color: "--text",
  hint_color: "--text-muted",
  button_color: "--accent",
  button_text_color: "--accent-ink",
};

export function initTelegram() {
  const tg = getTelegram();
  if (!tg) return; // running in a normal browser (local dev outside Telegram)

  tg.ready();
  tg.expand();

  const root = document.documentElement.style;
  for (const [tgKey, cssVar] of Object.entries(THEME_MAP)) {
    const value = tg.themeParams[tgKey];
    if (value) root.setProperty(cssVar, value);
  }
}

export function getTelegramUser() {
  return getTelegram()?.initDataUnsafe.user ?? null;
}
