import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label?: string;
  placeholder: string;
  options: DropdownOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  multi?: boolean;
  title?: string;
  loading?: boolean;
  emptyText?: string;
}

/**
 * A tap-to-open dropdown menu. Renders as a single field that opens a modal
 * list of options. Supports single select (tap an option, closes) or multi
 * select (tap toggles, user closes via Done/backdrop).
 */
export default function Dropdown({
  label,
  placeholder,
  options,
  selectedValues,
  onChange,
  multi = false,
  title,
  loading = false,
  emptyText = "Nothing to select yet",
}: DropdownProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  const selectedLabels = options
    .filter((o) => selectedValues.includes(o.value))
    .map((o) => o.label);

  const displayText =
    selectedLabels.length > 0 ? selectedLabels.join(", ") : placeholder;

  const toggleValue = (value: string) => {
    if (multi) {
      const next = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      onChange(next);
    } else {
      onChange([value]);
      setOpen(false);
    }
  };

  return (
    <View style={{ marginBottom: 14 }}>
      {!!label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.fieldText,
            {
              color:
                selectedLabels.length > 0 ? colors.text : colors.textFaint,
            },
          ]}
        >
          {displayText}
        </Text>
        <Ionicons
          name='chevron-down'
          size={18}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType='fade'
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[
              styles.sheet,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => {}}
          >
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                {title || placeholder}
              </Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name='close' size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {loading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator color={colors.accent} />
              </View>
            ) : options.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ color: colors.textFaint, fontSize: 14 }}>
                  {emptyText}
                </Text>
              </View>
            ) : (
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                style={{ maxHeight: 340 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const selected = selectedValues.includes(item.value);
                  return (
                    <TouchableOpacity
                      onPress={() => toggleValue(item.value)}
                      style={[
                        styles.option,
                        { borderBottomColor: colors.border },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={{
                          color: selected ? colors.accent : colors.text,
                          fontSize: 15,
                          fontWeight: selected ? "600" : "400",
                          flex: 1,
                        }}
                      >
                        {item.label}
                      </Text>
                      {selected && (
                        <Ionicons
                          name='checkmark'
                          size={18}
                          color={colors.accent}
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
            {multi && (
              <TouchableOpacity
                onPress={() => setOpen(false)}
                style={[styles.doneButton, { backgroundColor: colors.accent }]}
              >
                <Text
                  style={{
                    color: colors.onAccent,
                    fontWeight: "700",
                    fontSize: 15,
                  }}
                >
                  Done
                </Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  field: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  fieldText: {
    fontSize: 16,
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 28,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  emptyState: {
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  doneButton: {
    marginTop: 14,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
});