import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import TopBar from "../../components/TopBar";
import EmptyState from "../../components/EmptyState";
import { api } from "../../api/client";

interface Me {
  fullName: string;
  isAvailable: boolean;
  ratingAvg: number;
  ratingCount: number;
  workAreas?: string[];
}

export default function ProviderDashboardScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [me, setMe] = useState<Me | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("@hulu_user").then((raw) => {
      if (raw) setMe(JSON.parse(raw));
    });
  }, []);

  const toggleAvailability = async () => {
    if (!me) return;
    const next = !me.isAvailable;
    setUpdating(true);
    try {
      await api.patch("/provider/availability", { isAvailable: next });
      const updated = { ...me, isAvailable: next };
      setMe(updated);
      await AsyncStorage.setItem("@hulu_user", JSON.stringify(updated));
    } catch (e) {
      // silent — expected failures (e.g. network hiccup) shouldn't interrupt the flow
    } finally {
      setUpdating(false);
    }
  };

  if (!me) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBar title={t("provider.dashboard")} />
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Availability — a physical rocker switch, not a status label */}
        <View
          style={[
            styles.banner,
            me.isAvailable
              ? {
                  backgroundColor: colors.accentDim,
                  borderColor: colors.accent + "59",
                }
              : { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: colors.text }]}>
              {me.isAvailable
                ? t("provider.available")
                : t("provider.unavailable")}
            </Text>
            <Text
              style={[styles.bannerSubtitle, { color: colors.textSecondary }]}
            >
              {me.isAvailable
                ? t("provider.availableSubtitle")
                : t("provider.unavailableSubtitle")}
            </Text>
          </View>

          <TouchableOpacity
            onPress={toggleAvailability}
            disabled={updating}
            activeOpacity={0.85}
            style={[
              styles.rocker,
              me.isAvailable
                ? { backgroundColor: colors.accent, borderColor: colors.accent }
                : {
                    backgroundColor: colors.surfaceRaised,
                    borderColor: colors.borderStrong,
                  },
            ]}
          >
            {updating ? (
              <ActivityIndicator
                size='small'
                color={me.isAvailable ? colors.onAccent : colors.textSecondary}
                style={{ alignSelf: "center" }}
              />
            ) : (
              <View
                style={[
                  styles.rockerThumb,
                  me.isAvailable
                    ? {
                        alignSelf: "flex-end",
                        backgroundColor: colors.onAccent,
                      }
                    : {
                        alignSelf: "flex-start",
                        backgroundColor: colors.textFaint,
                      },
                ]}
              />
            )}
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.profileRow}>
            <View
              style={[styles.avatar, { backgroundColor: colors.accentDim }]}
            >
              <Text
                style={{
                  color: colors.accent,
                  fontWeight: "700",
                  fontSize: 15,
                }}
              >
                {me.fullName?.[0]?.toUpperCase() || "?"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]}>
                {me.fullName}
              </Text>
              <View style={styles.ratingRow}>
                <Ionicons name='star' size={13} color={colors.accent} />
                <Text style={{ color: colors.textSecondary, fontSize: 12.5 }}>
                  {me.ratingAvg?.toFixed(1) || "0.0"} ({me.ratingCount || 0}{" "}
                  {t("profile.reviews")})
                </Text>
              </View>
            </View>
          </View>
          {!!me.workAreas?.length && (
            <View style={styles.areaRow}>
              {me.workAreas.map((area) => (
                <View
                  key={area}
                  style={[
                    styles.areaChip,
                    { backgroundColor: colors.surfaceRaised },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 10.5,
                      color: colors.textSecondary,
                      fontWeight: "600",
                    }}
                  >
                    {area.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View
          style={[
            styles.requestsCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              {t("provider.newRequests")}
            </Text>
          </View>
          <View style={{ height: 140 }}>
            <EmptyState
              icon='file-tray-outline'
              title={t("provider.noRequestsTitle")}
              subtitle={t("provider.noRequestsSubtitle")}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  bannerTitle: { fontSize: 15, fontWeight: "700" },
  bannerSubtitle: { fontSize: 11.5, marginTop: 4, lineHeight: 16 },
  rocker: {
    width: 52,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: "center",
    padding: 3,
  },
  rockerThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  card: { borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 14 },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 15, fontWeight: "600" },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  areaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  areaChip: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  requestsCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingTop: 16,
    marginBottom: 14,
    overflow: "hidden",
  },
  sectionHead: { paddingHorizontal: 16, marginBottom: 4 },
  sectionLabel: { fontSize: 14, fontWeight: "600" },
});
