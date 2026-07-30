import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import TopBar from "../../components/TopBar";
import SettingsRow from "../../components/SettingsRow";
import { api } from "../../api/client";
import { formatCategoryPrice, PriceType } from "../../utils/pricing";

interface Category {
  id: string;
  nameEn: string;
  nameAm: string;
  priceType?: PriceType;
  price?: number;
}

interface Me {
  fullName: string;
  phone: string;
  city: string;
  subCity?: string;
  bio?: string;
  yearsExperience?: number;
  isVerified?: boolean;
  ratingAvg?: number;
  ratingCount?: number;
  workAreas?: string[];
  categoryIds?: string[];
  createdAt?: string;
}

export default function ProviderProfileScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { colors, mode, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const [me, setMe] = useState<Me | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("@hulu_user").then((raw) => {
      if (raw) setMe(JSON.parse(raw));
    });
    api
      .get("/categories")
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => {});
  }, []);

  const logout = async () => {
    await AsyncStorage.multiRemove(["@hulu_token", "@hulu_user"]);
    navigation.navigate("Login");
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

  const memberSince = me.createdAt
    ? new Date(me.createdAt).toLocaleDateString(
        language === "am" ? "am-ET" : "en-US",
        {
          month: "long",
          year: "numeric",
        },
      )
    : null;

  const myServices = categories.filter((c) => me.categoryIds?.includes(c.id));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBar title={t("nav.profile")} />
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.headerCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.accentDim }]}>
            <Text
              style={{ color: colors.accent, fontWeight: "700", fontSize: 22 }}
            >
              {me.fullName?.[0]?.toUpperCase() || "?"}
            </Text>
          </View>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]}>
              {me.fullName}
            </Text>
            {!!me.isVerified && (
              <View
                style={[
                  styles.verifiedPill,
                  { backgroundColor: colors.accentDim },
                ]}
              >
                <Ionicons
                  name='checkmark-circle'
                  size={12}
                  color={colors.accent}
                />
                <Text
                  style={{
                    color: colors.accent,
                    fontSize: 10.5,
                    fontWeight: "600",
                  }}
                >
                  {t("profile.verified")}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={{ color: colors.textSecondary, fontSize: 13, marginTop: 3 }}
          >
            {me.phone}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name='star' size={13} color={colors.accent} />
              <Text
                style={{
                  color: colors.text,
                  fontSize: 12.5,
                  fontWeight: "600",
                }}
              >
                {me.ratingAvg?.toFixed(1) || "0.0"}
              </Text>
              <Text style={{ color: colors.textFaint, fontSize: 11.5 }}>
                ({me.ratingCount || 0} {t("profile.reviews")})
              </Text>
            </View>
            {!!me.yearsExperience && (
              <View style={styles.metaItem}>
                <Ionicons
                  name='briefcase-outline'
                  size={13}
                  color={colors.textSecondary}
                />
                <Text style={{ color: colors.textSecondary, fontSize: 12.5 }}>
                  {me.yearsExperience} {t("profile.yearsExperience")}
                </Text>
              </View>
            )}
          </View>
        </View>

        {!!me.bio && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                marginBottom: 22,
              },
            ]}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                lineHeight: 20,
                paddingVertical: 14,
              }}
            >
              {me.bio}
            </Text>
          </View>
        )}

        {!!myServices.length && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textFaint }]}>
              {t("profile.servicesOffered")}
            </Text>
            <View style={styles.chipRow}>
              {myServices.map((c) => (
                <View
                  key={c.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 12.5,
                      fontWeight: "500",
                    }}
                  >
                    {c.nameAm}
                  </Text>
                  <Text
                    style={{
                      color: colors.accent,
                      fontSize: 11,
                      fontWeight: "600",
                      marginTop: 2,
                    }}
                  >
                    {formatCategoryPrice(c, t, language)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {!!me.workAreas?.length && (
          <>
            <Text
              style={[
                styles.sectionLabel,
                { color: colors.textFaint, marginTop: 4 },
              ]}
            >
              {t("profile.coverageAreas")}
            </Text>
            <View style={styles.chipRow}>
              {me.workAreas.map((area) => (
                <View
                  key={area}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: colors.accentDim,
                      borderColor: colors.accent + "40",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: colors.accent,
                      fontSize: 12.5,
                      fontWeight: "600",
                    }}
                  >
                    {area}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Text
          style={[
            styles.sectionLabel,
            { color: colors.textFaint, marginTop: 4 },
          ]}
        >
          {t("profile.preferences")}
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <SettingsRow
            icon='language-outline'
            label={t("profile.language")}
            value={language === "am" ? "አማርኛ" : "English"}
            onPress={toggleLanguage}
          />
          <SettingsRow
            icon={mode === "dark" ? "moon-outline" : "sunny-outline"}
            label={t("profile.appearance")}
            value={mode === "dark" ? t("profile.dark") : t("profile.light")}
            onPress={toggleTheme}
            last
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textFaint }]}>
          {t("profile.account")}
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {!!memberSince && (
            <SettingsRow
              icon='time-outline'
              label={t("profile.memberSince")}
              value={memberSince}
            />
          )}
          <SettingsRow
            icon='log-out-outline'
            label={t("profile.logout")}
            onPress={logout}
            danger
            last
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 24,
    marginBottom: 22,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 17, fontWeight: "700" },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  metaRow: { flexDirection: "row", gap: 16, marginTop: 14 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 4,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 22 },
  chip: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 22,
  },
});
