import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../contexts/ThemeContext";
import TopBar from "../../components/TopBar";
import EmptyState from "../../components/EmptyState";
import { api } from "../../api/client";

interface Party {
  id: string;
  fullName: string;
  phone: string;
}

interface BookingThread {
  id: string;
  status: string;
  customer?: Party;
  provider?: Party;
  category?: { nameEn: string; nameAm: string };
  updatedAt: string;
}

const statusColor = (status: string, colors: any) => {
  if (status === "accepted" || status === "in_progress") return colors.success;
  if (status === "completed") return colors.accentSecondary;
  if (status === "rejected" || status === "cancelled") return colors.textFaint;
  return colors.accent; // pending
};

// The Chat tab doubles as a conversation list: every booking (regardless of
// status) that isn't cancelled/declined gets a thread, since a customer or
// provider might reasonably want to ask something even before a job's
// accepted. Tapping a thread opens the real-time chat room for that booking.
export default function ChatScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [role, setRole] = useState<"customer" | "provider" | null>(null);
  const [threads, setThreads] = useState<BookingThread[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem("@hulu_user");
      let user: any = null;
      try {
        user = raw ? JSON.parse(raw) : null;
      } catch {
        user = null;
      }
      const myRole = user?.role === "provider" ? "provider" : "customer";
      setRole(myRole);

      const res = await api.get(
        myRole === "provider" ? "/provider/bookings" : "/customer/bookings",
      );
      const all: BookingThread[] = res.data.bookings || [];
      setThreads(
        all.filter((b) => b.status !== "cancelled" && b.status !== "rejected"),
      );
    } catch {
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openThread = (thread: BookingThread) => {
    const otherParty = role === "provider" ? thread.customer : thread.provider;
    navigation.navigate("ChatRoom", {
      bookingId: thread.id,
      otherPartyName: otherParty?.fullName || t("chat.title"),
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBar title={t("nav.chat")} />
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon='chatbubble-ellipses-outline'
              title={t("chat.emptyTitle")}
              subtitle={t("chat.emptySubtitle")}
            />
          ) : null
        }
        renderItem={({ item }) => {
          const otherParty =
            role === "provider" ? item.customer : item.provider;
          const categoryName =
            item.category?.nameAm || item.category?.nameEn || "";
          return (
            <TouchableOpacity
              onPress={() => openThread(item)}
              activeOpacity={0.85}
              style={[
                styles.row,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: colors.accentSecondary + "26" },
                ]}
              >
                <Text
                  style={{
                    color: colors.accentSecondary,
                    fontWeight: "700",
                    fontSize: 15,
                  }}
                >
                  {otherParty?.fullName?.[0]?.toUpperCase() || "?"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 14.5,
                    fontWeight: "600",
                  }}
                  numberOfLines={1}
                >
                  {otherParty?.fullName || t("chat.title")}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12.5,
                    marginTop: 2,
                  }}
                  numberOfLines={1}
                >
                  {categoryName}
                </Text>
              </View>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusColor(item.status, colors) },
                ]}
              />
              <Ionicons
                name='chevron-forward'
                size={16}
                color={colors.textFaint}
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});
