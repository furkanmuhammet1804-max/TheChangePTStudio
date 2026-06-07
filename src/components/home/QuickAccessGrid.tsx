import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';
import { QUICK_ACCESS } from '@/src/constants/strings';

export function QuickAccessGrid() {
  return (
    <View style={styles.grid}>
      {QUICK_ACCESS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.cell}
          activeOpacity={0.8}
          onPress={() =>
            router.push({ pathname: '/(tabs)/programs', params: { category: item.id } })
          }
        >
          <View style={styles.iconWrap}>
            <Ionicons name={item.icon as React.ComponentProps<typeof Ionicons>['name']} size={24} color={colors.accent} />
          </View>
          <Text style={styles.label}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cell: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.bodyMedium,
    color: colors.text,
    textAlign: 'center',
  },
});
