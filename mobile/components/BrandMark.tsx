import React from 'react';
import { Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

interface BrandMarkProps {
  size?: number;
  style?: ViewStyle;
}

// The "H" mark — amber → magenta → violet, the same gradient used across
// every accent moment in the app (call buttons, active tabs, availability glow).
export default function BrandMark({ size = 30, style }: BrandMarkProps) {
  const { colors } = useTheme();
  return (
    <LinearGradient
      colors={[colors.accent, colors.accentSecondary, colors.accentTertiary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.mark,
        { width: size, height: size, borderRadius: size * 0.32 },
        style,
      ]}
    >
      <Text style={[styles.letter, { fontSize: size * 0.46, color: colors.onAccent }]}>H</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  mark: { alignItems: 'center', justifyContent: 'center' },
  letter: { fontWeight: '700' },
});
