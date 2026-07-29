import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
}

// One row in a profile settings list — icon chip, label, optional trailing
// value, chevron when it's tappable. Shared by the customer and provider
// profile screens so "Language" / "Appearance" / "Log out" all look and
// behave the same.
export default function SettingsRow({
  icon,
  label,
  value,
  onPress,
  danger,
  last,
}: SettingsRowProps) {
  const { colors } = useTheme();
  const tint = danger ? colors.danger : colors.text;

  const content = (
    <View
      style={[
        styles.row,
        !last && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View
        style={[styles.iconWrap, { backgroundColor: colors.surfaceRaised }]}
      >
        <Ionicons
          name={icon}
          size={16}
          color={danger ? colors.danger : colors.textSecondary}
        />
      </View>
      <Text style={[styles.label, { color: tint }]}>{label}</Text>
      {!!value && (
        <Text style={[styles.value, { color: colors.textSecondary }]}>
          {value}
        </Text>
      )}
      {!!onPress && !danger && (
        <Ionicons
          name='chevron-forward'
          size={16}
          color={colors.textFaint}
          style={{ marginLeft: 4 }}
        />
      )}
    </View>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.65}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 11,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { flex: 1, fontSize: 14, fontWeight: "500" },
  value: { fontSize: 13 },
});
