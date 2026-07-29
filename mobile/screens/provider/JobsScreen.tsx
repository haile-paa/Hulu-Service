import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import TopBar from "../../components/TopBar";
import EmptyState from "../../components/EmptyState";
import { api } from "../../api/client";

interface Party {
  id: string;
  fullName: string;
  phone: string;
}

interface Booking {
  id: string;
  status: string;
  description?: string;
  address?: string;
  customer?: Party;
  category?: { nameEn: string; nameAm: string };
  createdAt: string;
}

const STATUS_META: Record<string, { color: string; labelKey: string }> = {
  pending: { color: "accent", labelKey: "bookings.statusPending" },
  accepted: { color: "success", labelKey: "bookings.statusAccepted" },
  in_progress: { color: "success", labelKey: "bookings.statusInProgress" },
  completed: { color: "accentSecondary", labelKey: "bookings.statusCompleted" },
  rejected: { color: "danger", labelKey: "bookings.statusRejected" },
  cancelled: { color: "textFaint", labelKey: "bookings.statusCancelled" },
};

export default function JobsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get("/provider/bookings");
      setBookings(res.data.bookings || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const respond = async (booking: Booking, action: "accept" | "decline") => {
    setBusyId(booking.id);
    try {
      await api.patch(`/provider/bookings/${booking.id}/respond`, { action });
      load();
    } catch {
      Alert.alert(t("common.error"), t("bookings.respondFailed"));
    } finally {
      setBusyId(null);
    }
  };

  const markComplete = async (booking: Booking) => {
    setBusyId(booking.id);
    try {
      await api.patch(`/provider/bookings/${booking.id}/complete`);
      load();
    } catch {
      Alert.alert(t("common.error"), t("bookings.completeFailed"));
    } finally {
      setBusyId(null);
    }
  };

  const openChat = (booking: Booking) => {
    navigation.navigate("ChatRoom", {
      bookingId: booking.id,
      otherPartyName: booking.customer?.fullName,
    });
  };

  const call = (phone?: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBar title={t("provider.myJobs")} />
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon='briefcase-outline'
              title={t("bookings.emptyTitle")}
              subtitle={t("bookings.emptySubtitleProvider")}
            />
          ) : null
        }
        renderItem={({ item }) => {
          const meta = STATUS_META[item.status] || STATUS_META.pending;
          const categoryName =
            item.category?.nameAm || item.category?.nameEn || "";
          const busy = busyId === item.id;
          return (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.headerRow}>
                <Text style={[styles.name, { color: colors.text }]}>
                  {item.customer?.fullName || t("bookings.customer")}
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: (colors as any)[meta.color] + "22" },
                  ]}
                >
                  <Text
                    style={{
                      color: (colors as any)[meta.color],
                      fontSize: 11,
                      fontWeight: "700",
                    }}
                  >
                    {t(meta.labelKey)}
                  </Text>
                </View>
              </View>

              {!!categoryName && (
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12.5,
                    marginTop: 4,
                  }}
                >
                  {categoryName}
                </Text>
              )}
              {!!item.description && (
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 13,
                    marginTop: 8,
                  }}
                  numberOfLines={3}
                >
                  {item.description}
                </Text>
              )}
              {!!item.address && (
                <View style={styles.metaRow}>
                  <Ionicons
                    name='location-outline'
                    size={13}
                    color={colors.textFaint}
                  />
                  <Text style={{ color: colors.textFaint, fontSize: 12 }}>
                    {item.address}
                  </Text>
                </View>
              )}

              <View style={styles.actionsRow}>
                {item.status === "pending" && (
                  <>
                    <TouchableOpacity
                      onPress={() => respond(item, "accept")}
                      disabled={busy}
                      style={[
                        styles.actionBtnFilled,
                        { backgroundColor: colors.success },
                      ]}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 13,
                          fontWeight: "700",
                        }}
                      >
                        {t("bookings.accept")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => respond(item, "decline")}
                      disabled={busy}
                      style={[styles.actionBtn, { borderColor: colors.border }]}
                    >
                      <Text
                        style={{
                          color: colors.danger,
                          fontSize: 13,
                          fontWeight: "600",
                        }}
                      >
                        {t("bookings.decline")}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                {(item.status === "accepted" ||
                  item.status === "in_progress") && (
                  <TouchableOpacity
                    onPress={() => markComplete(item)}
                    disabled={busy}
                    style={[
                      styles.actionBtnFilled,
                      { backgroundColor: colors.accentSecondary },
                    ]}
                  >
                    <Text
                      style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}
                    >
                      {t("bookings.markComplete")}
                    </Text>
                  </TouchableOpacity>
                )}
                {item.status !== "cancelled" && item.status !== "rejected" && (
                  <TouchableOpacity
                    onPress={() => openChat(item)}
                    style={[styles.actionBtn, { borderColor: colors.border }]}
                  >
                    <Ionicons
                      name='chatbubble-outline'
                      size={14}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                )}
                {!!item.customer?.phone && (
                  <TouchableOpacity
                    onPress={() => call(item.customer?.phone)}
                    style={[
                      styles.actionBtn,
                      {
                        borderColor: colors.accentSecondary,
                        marginLeft: "auto",
                      },
                    ]}
                  >
                    <Ionicons
                      name='call-outline'
                      size={14}
                      color={colors.accentSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 15, marginBottom: 12 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: { fontSize: 15, fontWeight: "600", flex: 1, marginRight: 8 },
  statusPill: { borderRadius: 10, paddingHorizontal: 9, paddingVertical: 4 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 13,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionBtnFilled: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
});
