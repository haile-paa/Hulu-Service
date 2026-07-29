import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../contexts/ThemeContext";
import TopBar from "../../components/TopBar";
import Dropdown from "../../components/Dropdown";
import { api } from "../../api/client";

type Role = "customer" | "provider";

interface Category {
  id: string;
  nameEn: string;
  nameAm: string;
  icon: string;
}

// Experience buckets shown in the dropdown; value is the number of years
// (lower bound) that gets sent to the backend as yearsExperience.
const EXPERIENCE_OPTIONS = [
  { value: "0", labelKey: "auth.exp0to1" },
  { value: "1", labelKey: "auth.exp1to3" },
  { value: "3", labelKey: "auth.exp3to5" },
  { value: "5", labelKey: "auth.exp5to10" },
  { value: "10", labelKey: "auth.exp10plus" },
];

export default function RegisterScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState<Role>("customer");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role === "provider") {
      if (categories.length === 0) {
        setLoadingOptions(true);
        api
          .get("/categories")
          .then((res) => setCategories(res.data.categories || []))
          .catch(() =>
            setError(
              "Couldn't load work types. Check that the server is reachable and try again.",
            ),
          )
          .finally(() => setLoadingOptions(false));
      }
      if (areas.length === 0) {
        api
          .get("/areas")
          .then((res) => setAreas(res.data.areas || []))
          .catch(() =>
            setError(
              "Couldn't load coverage areas. Check that the server is reachable and try again.",
            ),
          );
      }
    }
  }, [role]);

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
    );
  };

  const handleRegister = async () => {
    setError("");
    if (!fullName || !phone || !password || !city) {
      setError(t("auth.fillAllFields"));
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        fullName,
        phone,
        password,
        city,
        role,
        language: "am",
        categoryIds: role === "provider" ? selectedCategoryIds : undefined,
        workAreas: role === "provider" ? selectedAreas : undefined,
        yearsExperience:
          role === "provider" && selectedExperience[0]
            ? Number(selectedExperience[0])
            : undefined,
      });
      const { token, user } = res.data;
      await AsyncStorage.setItem("@hulu_token", token);
      await AsyncStorage.setItem("@hulu_user", JSON.stringify(user));
      navigation.replace(
        role === "provider" ? "ProviderDashboard" : "CustomerHome",
      );
    } catch (e: any) {
      setError(e?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBar title={t("auth.register")} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.inner}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t("auth.iAmA")}
          </Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              onPress={() => setRole("customer")}
              style={[
                styles.roleCard,
                role === "customer"
                  ? {
                      borderColor: colors.accentSecondary,
                      backgroundColor: colors.accentSecondary + "1A",
                    }
                  : {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
              ]}
            >
              <Text
                style={{
                  color:
                    role === "customer" ? colors.accentSecondary : colors.text,
                  fontWeight: "600",
                  fontSize: 15,
                }}
              >
                {t("auth.customer")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRole("provider")}
              style={[
                styles.roleCard,
                role === "provider"
                  ? {
                      borderColor: colors.accent,
                      backgroundColor: colors.accentDim,
                    }
                  : {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
              ]}
            >
              <Text
                style={{
                  color: role === "provider" ? colors.accent : colors.text,
                  fontWeight: "600",
                  fontSize: 15,
                }}
              >
                {t("auth.provider")}
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder={t("auth.fullName")}
            placeholderTextColor={colors.textFaint}
            value={fullName}
            onChangeText={setFullName}
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
          <TextInput
            placeholder={t("auth.phone")}
            placeholderTextColor={colors.textFaint}
            value={phone}
            onChangeText={setPhone}
            keyboardType='phone-pad'
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
          <TextInput
            placeholder={t("auth.city")}
            placeholderTextColor={colors.textFaint}
            value={city}
            onChangeText={setCity}
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
          <TextInput
            placeholder={t("auth.password")}
            placeholderTextColor={colors.textFaint}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />

          {role === "provider" && (
            <>
              <Dropdown
                label={t("auth.workType")}
                placeholder={t("auth.selectWorkType")}
                title={t("auth.selectWorkType")}
                options={categories.map((cat) => ({
                  value: cat.id,
                  label: cat.nameAm,
                }))}
                selectedValues={selectedCategoryIds}
                onChange={setSelectedCategoryIds}
                loading={loadingOptions}
                emptyText='No work types available — check your connection and reopen the app.'
                multi
              />

              <Dropdown
                label={t("auth.experience")}
                placeholder={t("auth.selectExperience")}
                title={t("auth.selectExperience")}
                options={EXPERIENCE_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: t(opt.labelKey),
                }))}
                selectedValues={selectedExperience}
                onChange={setSelectedExperience}
              />

              <Text
                style={[
                  styles.label,
                  { color: colors.textSecondary, marginTop: 16 },
                ]}
              >
                {t("profile.coverageAreas")}
              </Text>
              <View style={styles.chipGrid}>
                {areas.map((area) => {
                  const selected = selectedAreas.includes(area);
                  return (
                    <TouchableOpacity
                      key={area}
                      onPress={() => toggleArea(area)}
                      style={[
                        styles.chip,
                        selected
                          ? {
                              borderColor: colors.accentSecondary,
                              backgroundColor: colors.accentSecondary,
                            }
                          : {
                              borderColor: colors.border,
                              backgroundColor: colors.surface,
                            },
                      ]}
                    >
                      <Text
                        style={{
                          color: selected
                            ? colors.onAccentSecondary
                            : colors.text,
                          fontSize: 14,
                          fontWeight: "500",
                        }}
                      >
                        {area}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {!!error && (
            <Text style={{ color: colors.danger, marginTop: 10, fontSize: 13 }}>
              {error}
            </Text>
          )}

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.88}
            style={styles.submitWrap}
          >
            <LinearGradient
              colors={[colors.accent, colors.accentSecondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButton}
            >
              {loading ? (
                <ActivityIndicator color={colors.onAccent} />
              ) : (
                <Text
                  style={{
                    color: colors.onAccent,
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  {t("auth.registerButton")}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={{ marginTop: 18, marginBottom: 10 }}
          >
            <Text
              style={{
                color: colors.textSecondary,
                textAlign: "center",
                fontSize: 14,
              }}
            >
              {t("auth.haveAccount")}{" "}
              <Text
                style={{ color: colors.accentSecondary, fontWeight: "600" }}
              >
                {t("auth.login")}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inner: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  roleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  roleCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 14,
    fontSize: 16,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  submitWrap: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 20,
  },
  submitButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
});