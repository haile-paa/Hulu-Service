import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../contexts/ThemeContext";
import BrandMark from "../../components/BrandMark";
import TopBar from "../../components/TopBar";
import { api } from "../../api/client";
import { saveSession } from "../../utils/session";

export default function LoginScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { phone, password });
      const { token, user } = res.data;
      await saveSession(token, user);
      navigation.replace(
        user.role === "provider" ? "ProviderDashboard" : "CustomerHome",
      );
    } catch (e: any) {
      setError(e?.response?.data?.error || "Invalid phone or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBar title={t("common.appName")} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"} // ✅ better for Android
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // fine-tune
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          scrollEnabled={true}
          // 👇 this ensures the scroll view adjusts when keyboard appears
        >
          <View style={styles.inner}>
            <View style={styles.brandBlock}>
              <BrandMark size={48} />
              <Text style={[styles.tagline, { color: colors.textSecondary }]}>
                Verified local help, one call away
              </Text>
            </View>

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

            {!!error && (
              <Text style={[styles.errorText, { color: colors.danger }]}>
                {error}
              </Text>
            )}

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={styles.buttonWrap}
            >
              <LinearGradient
                colors={[colors.accent, colors.accentSecondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                {loading ? (
                  <ActivityIndicator color={colors.onAccent} />
                ) : (
                  <Text style={[styles.buttonText, { color: colors.onAccent }]}>
                    {t("auth.loginButton")}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              style={styles.registerLink}
            >
              <Text
                style={[styles.registerText, { color: colors.textSecondary }]}
              >
                {t("auth.noAccount")}{" "}
                <Text
                  style={[
                    styles.registerHighlight,
                    { color: colors.accentSecondary },
                  ]}
                >
                  {t("auth.register")}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  inner: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  brandBlock: {
    alignItems: "center",
    marginBottom: 28,
  },
  tagline: {
    fontSize: 13,
    marginTop: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 14,
    fontSize: 17,
  },
  errorText: {
    fontSize: 13,
    marginBottom: 10,
    textAlign: "center",
  },
  buttonWrap: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 4,
  },
  button: {
    paddingVertical: 17,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 17,
  },
  registerLink: {
    marginTop: 22,
  },
  registerText: {
    textAlign: "center",
    fontSize: 14,
  },
  registerHighlight: {
    fontWeight: "600",
  },
});
