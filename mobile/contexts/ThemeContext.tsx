import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark";

interface ThemeColors {
  background: string;
  surface: string;
  surfaceRaised: string;
  card: string;
  text: string;
  textSecondary: string;
  textFaint: string;
  border: string;
  borderStrong: string;
  // Orange — the provider / "availability" accent
  accent: string;
  onAccent: string;
  accentDim: string;
  // Teal — the customer / discovery accent
  accentSecondary: string;
  accentTertiary: string;
  onAccentSecondary: string;
  success: string;
  warning: string;
  danger: string;
}

// Palette sampled directly from assets/icon.png (the Hulu Service mark):
// teal gradient background (#0E9387 → #0A2A42) with an orange checkmark
// (#F7941E). Every accent below is built from those three colors so the
// whole app reads as one brand with the logo.
const lightColors: ThemeColors = {
  background: "#F4F9F8",
  surface: "#FFFFFF",
  surfaceRaised: "#FFFFFF",
  card: "#FFFFFF",
  text: "#0F2624",
  textSecondary: "#5C7472",
  textFaint: "#9BB2AF",
  border: "#DCEBE9",
  borderStrong: "#C2D9D6",
  // Orange — the provider / "availability" accent (from the logo checkmark)
  accent: "#F7941E",
  onAccent: "#12302D",
  accentDim: "#FBE0BB",
  // Teal — the customer / discovery accent (from the logo background)
  accentSecondary: "#0E9387",
  accentTertiary: "#0A3D4A",
  onAccentSecondary: "#FFFFFF",
  success: "#1F9D63",
  warning: "#C97F0A",
  danger: "#D13A4A",
};

const darkColors: ThemeColors = {
  background: "#081C20",
  surface: "#0F2A2E",
  surfaceRaised: "#153338",
  card: "#153338",
  text: "#EAF6F4",
  textSecondary: "#8FADA9",
  textFaint: "#5C7875",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",
  accent: "#FFA640",
  onAccent: "#0D211F",
  accentDim: "rgba(255,166,64,0.16)",
  accentSecondary: "#2DBFAF",
  accentTertiary: "#12707C",
  onAccentSecondary: "#052220",
  success: "#35D68A",
  warning: "#F5C242",
  danger: "#FF5C6C",
};

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "@hulu_theme_mode";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(
    systemScheme === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === "light" || saved === "dark") {
        setMode(saved);
      }
    });
  }, []);

  const setTheme = (next: ThemeMode) => {
    setMode(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  };

  const toggleTheme = () => setTheme(mode === "light" ? "dark" : "light");

  const colors = mode === "light" ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
