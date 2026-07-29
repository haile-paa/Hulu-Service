import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

import ProviderDashboardScreen from '../screens/provider/DashboardScreen';
import ProviderJobsScreen from '../screens/provider/JobsScreen';
import ChatScreen from '../screens/customer/ChatScreen';
import ProviderProfileScreen from '../screens/provider/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function ProviderNavigator() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: 'grid-outline',
            Jobs: 'briefcase-outline',
            Chat: 'chatbubble-outline',
            Profile: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={ProviderDashboardScreen} options={{ title: t('provider.dashboard') }} />
      <Tab.Screen name="Jobs" component={ProviderJobsScreen} options={{ title: t('provider.myJobs') }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: t('nav.chat') }} />
      <Tab.Screen name="Profile" component={ProviderProfileScreen} options={{ title: t('nav.profile') }} />
    </Tab.Navigator>
  );
}
