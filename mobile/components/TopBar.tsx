import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ correct import
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import BrandMark from "./BrandMark";

interface TopBarProps {
  title?: string;
  onBack?: () => void;
  subtitle?: string;
}

export default function TopBar({ title, onBack, subtitle }: TopBarProps) {
  const { mode, colors, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();

  return (
    <SafeAreaView
      edges={["top"]} // only top safe area
      style={{ backgroundColor: colors.background }}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.left}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              style={[
                styles.iconButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons name='chevron-back' size={19} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <BrandMark size={32} />
          )}
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {title || ""} {/* fallback to avoid "text string" error */}
            </Text>
            {!!subtitle && (
              <Text
                style={{ color: colors.textSecondary, fontSize: 11.5 }}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={toggleLanguage}
            style={[
              styles.pill,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, { color: colors.text }]}>
              {language === "am" ? "AMH" : "ENG"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              styles.iconButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={mode === "light" ? "moon-outline" : "sunny-outline"}
              size={18}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0, // no border – using shadow instead
    // subtle shadow for modern look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
