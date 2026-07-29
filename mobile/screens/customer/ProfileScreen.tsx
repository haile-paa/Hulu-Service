import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import TopBar from "../../components/TopBar";
import SettingsRow from "../../components/SettingsRow";

interface Me {
  fullName: string;
  phone: string;
  city: string;
  subCity?: string;
  createdAt?: string;
}

export default function ProfileScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { colors, mode, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("@hulu_user").then((raw) => {
      if (raw) setMe(JSON.parse(raw));
    });
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
        <ActivityIndicator color={colors.accentSecondary} />
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
                fontSize: 22,
              }}
            >
              {me.fullName?.[0]?.toUpperCase() || "?"}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            {me.fullName}
          </Text>
          <Text
            style={{ color: colors.textSecondary, fontSize: 13, marginTop: 3 }}
          >
            {me.phone}
          </Text>
          <View
            style={[styles.cityPill, { backgroundColor: colors.surfaceRaised }]}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11.5,
                fontWeight: "500",
              }}
            >
              {[me.subCity, me.city].filter(Boolean).join(", ")}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textFaint }]}>
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
  name: { fontSize: 17, fontWeight: "700" },
  cityPill: {
    marginTop: 12,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 22,
  },
});
