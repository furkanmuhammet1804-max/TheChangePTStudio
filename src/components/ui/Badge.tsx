import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '@/src/theme';

interface BadgeProps {
  label: string;
  variant?: 'accent' | 'gold' | 'surface' | 'success';
}

export function Badge({ label, variant = 'surface' }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant]]}>
      <Text style={[styles.label, styles[`label_${variant}`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  accent: {
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  gold: {
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  surface: {
    backgroundColor: colors.surfaceTertiary,
  },
  success: {
    backgroundColor: 'rgba(76,175,80,0.15)',
    borderWidth: 1,
    borderColor: colors.success,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  label_accent: { color: colors.accent },
  label_gold: { color: colors.gold },
  label_surface: { color: colors.textSecondary },
  label_success: { color: colors.success },
});
