import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { borderRadius, colors, typography } from '@/src/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  title: string;
  icon: IoniconName;
  iconActive: IoniconName;
}

const TABS: TabConfig[] = [
  { name: 'index', title: 'Ana Sayfa', icon: 'home-outline', iconActive: 'home' },
  { name: 'programs', title: 'Programlar', icon: 'grid-outline', iconActive: 'grid' },
  { name: 'exercises', title: 'Egzersizler', icon: 'barbell-outline', iconActive: 'barbell' },
  { name: 'progress', title: 'Gelişim', icon: 'stats-chart-outline', iconActive: 'stats-chart' },
  { name: 'profile', title: 'Profil', icon: 'person-outline', iconActive: 'person' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? tab.iconActive : tab.icon}
                size={22}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    elevation: 0,
  },
  tabLabel: {
    ...typography.caption,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  tabItem: {
    borderRadius: borderRadius.sm,
  },
});
