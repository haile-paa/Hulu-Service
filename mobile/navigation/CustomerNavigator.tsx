import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

import CustomerHomeScreen from '../screens/customer/HomeScreen';
import CustomerBookingsScreen from '../screens/customer/BookingsScreen';
import ChatScreen from '../screens/customer/ChatScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function CustomerNavigator() {
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
            Home: 'home-outline',
            Bookings: 'calendar-outline',
            Chat: 'chatbubble-outline',
            Profile: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={CustomerHomeScreen} options={{ title: t('nav.home') }} />
      <Tab.Screen name="Bookings" component={CustomerBookingsScreen} options={{ title: t('nav.bookings') }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: t('nav.chat') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('nav.profile') }} />
    </Tab.Navigator>
  );
}
