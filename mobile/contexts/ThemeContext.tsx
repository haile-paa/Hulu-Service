import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

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
  // Amber — the provider / "availability" accent
  accent: string;
  onAccent: string;
  accentDim: string;
  // Magenta→violet — the customer / discovery accent
  accentSecondary: string;
  accentTertiary: string;
  onAccentSecondary: string;
  success: string;
  warning: string;
  danger: string;
}

const lightColors: ThemeColors = {
  background: '#F6F5FA',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  card: '#FFFFFF',
  text: '#17171C',
  textSecondary: '#6B6B78',
  textFaint: '#A2A2AE',
  border: '#E7E5EE',
  borderStrong: '#D6D3E2',
  accent: '#C99500',
  onAccent: '#17171C',
  accentDim: '#F3E4B8',
  accentSecondary: '#C81B7D',
  accentTertiary: '#6B21D8',
  onAccentSecondary: '#FFFFFF',
  success: '#1F9D63',
  warning: '#B9790A',
  danger: '#D13A4A',
};

const darkColors: ThemeColors = {
  background: '#0A0A0E',
  surface: '#15151C',
  surfaceRaised: '#1C1C25',
  card: '#1C1C25',
  text: '#F4F4F7',
  textSecondary: '#8D8D9A',
  textFaint: '#5F5F6C',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',
  accent: '#F4C430',
  onAccent: '#0A0A0E',
  accentDim: 'rgba(244,196,48,0.14)',
  accentSecondary: '#E21F8F',
  accentTertiary: '#7B2FF7',
  onAccentSecondary: '#FFFFFF',
  success: '#35D68A',
  warning: '#F2A93A',
  danger: '#FF5C6C',
};

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = '@hulu_theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') {
        setMode(saved);
      }
    });
  }, []);

  const setTheme = (next: ThemeMode) => {
    setMode(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  };

  const toggleTheme = () => setTheme(mode === 'light' ? 'dark' : 'light');

  const colors = mode === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
