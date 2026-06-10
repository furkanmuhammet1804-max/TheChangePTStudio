import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { borderRadius, colors, gradients, shadows, spacing, typography } from '@/src/theme';

interface WeeklyProgressCardProps {
  completed: number;
  target: number;
}

export function WeeklyProgressCard({ completed, target }: WeeklyProgressCardProps) {
  const progress = target > 0 ? completed / target : 0;
  const remaining = Math.max(0, target - completed);
  const done = remaining === 0;

  const message = done
    ? 'Bu haftaki hedefini tamamladın. Disiplinini koru.'
    : completed === 0
    ? 'Bu hafta güçlü bir başlangıç yap.'
    : progress < 0.5
    ? 'Hedefine doğru ilerliyorsun, devam et.'
    : 'Bu hafta güçlü gidiyorsun. Disiplini bozma.';

  return (
    <LinearGradient
      colors={gradients.surface}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.left}>
          <View style={styles.iconChip}>
            <Ionicons name={done ? 'checkmark-done' : 'calendar'} size={16} color={colors.accent} />
          </View>
          <View>
            <Text style={styles.label}>BU HAFTAKİ İLERLEMEN</Text>
            <Text style={styles.count}>
              <Text style={styles.countAccent}>{completed}</Text>
              <Text style={styles.countTotal}>/{target} antrenman</Text>
            </Text>
          </View>
        </View>
        <View style={styles.percentBox}>
          <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>
        </View>
      </View>

      <ProgressBar progress={progress} height={10} />

      <Text style={styles.subtitle}>{message}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconChip: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  count: {
    ...typography.h3,
  },
  countAccent: {
    color: colors.text,
    fontWeight: '800',
  },
  countTotal: {
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 15,
  },
  percentBox: {
    backgroundColor: colors.accentMuted,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md - 2,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  percent: {
    ...typography.h4,
    color: colors.accent,
    fontWeight: '800',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
