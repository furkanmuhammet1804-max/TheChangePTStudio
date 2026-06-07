import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';
import { DIFFICULTY_LABELS } from '@/src/constants/strings';
import { Workout } from '@/src/types';
import { formatDuration } from '@/src/utils/formatters';

interface HeroWorkoutCardProps {
  workout: Workout;
  label?: string;
}

export function HeroWorkoutCard({ workout, label = "Bugünün Antrenmanı" }: HeroWorkoutCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <View style={styles.dot} />
          <Text style={styles.label}>{label}</Text>
        </View>
        <Ionicons name="flash" size={20} color={colors.accent} />
      </View>

      <Text style={styles.title}>{workout.name}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {workout.description}
      </Text>

      <View style={styles.metaRow}>
        <MetaBadge icon="time-outline" value={formatDuration(workout.duration)} />
        <MetaBadge icon="flame-outline" value={`~${workout.calories} kcal`} />
        <MetaBadge icon="stats-chart-outline" value={DIFFICULTY_LABELS[workout.difficulty]} />
        <MetaBadge
          icon="barbell-outline"
          value={`${workout.exercises.length} hareket`}
        />
      </View>

      <TouchableOpacity
        style={styles.startBtn}
        activeOpacity={0.85}
        onPress={() =>
          router.push({ pathname: '/workout/[id]', params: { id: workout.id } })
        }
      >
        <Ionicons name="play" size={16} color={colors.background} />
        <Text style={styles.startLabel}>ANTRENMANI BAŞLAT</Text>
      </TouchableOpacity>
    </View>
  );
}

function MetaBadge({
  icon,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
}) {
  return (
    <View style={styles.metaBadge}>
      <Ionicons name={icon} size={12} color={colors.accent} />
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  label: {
    ...typography.label,
    color: colors.accent,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
  },
  metaValue: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  startBtn: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md - 2,
    ...shadows.accent,
  },
  startLabel: {
    ...typography.label,
    color: colors.background,
    fontWeight: '800',
    letterSpacing: 1.2,
    fontSize: 13,
  },
});
