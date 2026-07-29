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
  provider?: Party;
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

export default function BookingsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get("/customer/bookings");
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

  const cancelBooking = (booking: Booking) => {
    Alert.alert(
      t("bookings.cancelConfirmTitle"),
      t("bookings.cancelConfirmBody"),
      [
        { text: t("common.no"), style: "cancel" },
        {
          text: t("common.yes"),
          style: "destructive",
          onPress: async () => {
            setCancellingId(booking.id);
            try {
              await api.patch(`/customer/bookings/${booking.id}/cancel`);
              load();
            } catch {
              Alert.alert(t("common.error"), t("bookings.cancelFailed"));
            } finally {
              setCancellingId(null);
            }
          },
        },
      ],
    );
  };

  const openChat = (booking: Booking) => {
    navigation.navigate("ChatRoom", {
      bookingId: booking.id,
      otherPartyName: booking.provider?.fullName,
    });
  };

  const call = (phone?: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBar title={t("nav.bookings")} />
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
              icon='calendar-outline'
              title={t("bookings.emptyTitle")}
              subtitle={t("bookings.emptySubtitleCustomer")}
            />
          ) : null
        }
        renderItem={({ item }) => {
          const meta = STATUS_META[item.status] || STATUS_META.pending;
          const categoryName =
            item.category?.nameAm || item.category?.nameEn || "";
          return (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.headerRow}>
                <Text style={[styles.name, { color: colors.text }]}>
                  {item.provider?.fullName || t("providerList.defaultTitle")}
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
                  <TouchableOpacity
                    onPress={() => cancelBooking(item)}
                    disabled={cancellingId === item.id}
                    style={[styles.actionBtn, { borderColor: colors.border }]}
                  >
                    <Text
                      style={{
                        color: colors.danger,
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      {cancellingId === item.id
                        ? t("bookings.cancelling")
                        : t("bookings.cancel")}
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
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      {t("bookings.chat")}
                    </Text>
                  </TouchableOpacity>
                )}
                {!!item.provider?.phone && (
                  <TouchableOpacity
                    onPress={() => call(item.provider?.phone)}
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
});
