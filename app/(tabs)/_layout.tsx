import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography } from '@/src/theme';

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
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          { height: 60 + bottomPad, paddingBottom: bottomPad },
        ],
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
              <View style={styles.iconWrap}>
                {focused && <View style={styles.activeIndicator} />}
                <Ionicons
                  name={focused ? tab.iconActive : tab.icon}
                  size={23}
                  color={color}
                />
              </View>
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
    paddingTop: 10,
    elevation: 0,
  },
  tabLabel: {
    ...typography.caption,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  tabItem: {
    paddingTop: 2,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: -10,
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
});
