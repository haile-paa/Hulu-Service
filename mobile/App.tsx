import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { I18nextProvider } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context"; // ✅ import provider

import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { initI18n } from "./locales/i18n";
import i18n from "./locales/i18n";
import { getValidSession } from "./utils/session";

import LoginScreen from "./screens/auth/LoginScreen";
import RegisterScreen from "./screens/auth/RegisterScreen";
import CustomerNavigator from "./navigation/CustomerNavigator";
import ProviderNavigator from "./navigation/ProviderNavigator";
import ProviderListScreen from "./screens/customer/ProviderListScreen";
import ChatRoomScreen from "./screens/shared/ChatRoomScreen";

const Stack = createNativeStackNavigator();

function RootNavigator({ initialRouteName }: { initialRouteName: string }) {
  const { colors } = useTheme();
  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: colors.accent,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.accent,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRouteName}
      >
        <Stack.Screen name='Login' component={LoginScreen} />
        <Stack.Screen name='Register' component={RegisterScreen} />
        <Stack.Screen name='CustomerHome' component={CustomerNavigator} />
        <Stack.Screen name='ProviderDashboard' component={ProviderNavigator} />
        <Stack.Screen
          name='ProviderList'
          component={ProviderListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='ChatRoom'
          component={ChatRoomScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [initialRouteName, setInitialRouteName] = useState("Login");

  useEffect(() => {
    async function bootstrap() {
      await initI18n();

      // Skip straight past Login if a session was saved within the last
      // 48 hours; otherwise it's already been cleared and the user signs
      // in again as normal.
      const session = await getValidSession();
      if (session) {
        setInitialRouteName(
          session.user.role === "provider"
            ? "ProviderDashboard"
            : "CustomerHome",
        );
      }

      setReady(true);
    }
    bootstrap();
  }, []);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size='large' />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <LanguageProvider>
            <RootNavigator initialRouteName={initialRouteName} />
          </LanguageProvider>
        </ThemeProvider>
      </I18nextProvider>
    </SafeAreaProvider>
  );
}
