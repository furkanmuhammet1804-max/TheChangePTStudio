import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';

interface WeeklyProgressCardProps {
  completed: number;
  target: number;
}

export function WeeklyProgressCard({ completed, target }: WeeklyProgressCardProps) {
  const progress = target > 0 ? completed / target : 0;
  const remaining = Math.max(0, target - completed);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>HAFTALIK İLERLEME</Text>
          <Text style={styles.count}>
            <Text style={styles.countAccent}>{completed}</Text>
            <Text style={styles.countTotal}>/{target} antrenman</Text>
          </Text>
        </View>
        <View style={styles.percentBox}>
          <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>
        </View>
      </View>

      <ProgressBar progress={progress} height={8} />

      <Text style={styles.subtitle}>
        {remaining === 0
          ? 'Bu haftaki hedefini tamamladın!'
          : `Hedefine ${remaining} antrenman kaldı`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  count: {
    ...typography.h3,
  },
  countAccent: {
    color: colors.accent,
    fontWeight: '800',
  },
  countTotal: {
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 16,
  },
  percentBox: {
    backgroundColor: colors.accentMuted,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  percent: {
    ...typography.label,
    color: colors.accent,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
