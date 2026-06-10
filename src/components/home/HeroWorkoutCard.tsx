import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, gradients, shadows, spacing, typography } from '@/src/theme';
import { DIFFICULTY_LABELS } from '@/src/constants/strings';
import { Workout } from '@/src/types';
import { formatDuration } from '@/src/utils/formatters';

interface HeroWorkoutCardProps {
  workout: Workout;
  label?: string;
}

export function HeroWorkoutCard({ workout, label = 'Bugünün Odağı' }: HeroWorkoutCardProps) {
  return (
    <LinearGradient
      colors={gradients.surfaceRaised}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Ambient accent glow in the corner */}
      <LinearGradient
        colors={['rgba(197,241,53,0.16)', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.glow}
        pointerEvents="none"
      />

      <View style={styles.header}>
        <View style={styles.labelRow}>
          <View style={styles.dot} />
          <Text style={styles.label}>{label}</Text>
        </View>
        <View style={styles.flashChip}>
          <Ionicons name="flash" size={14} color={colors.accent} />
        </View>
      </View>

      <Text style={styles.title}>{workout.name}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {workout.description}
      </Text>

      <View style={styles.metaRow}>
        <MetaBadge icon="time-outline" value={formatDuration(workout.duration)} />
        <MetaBadge icon="flame-outline" value={`~${workout.calories} kcal`} />
        <MetaBadge icon="stats-chart-outline" value={DIFFICULTY_LABELS[workout.difficulty]} />
        <MetaBadge icon="barbell-outline" value={`${workout.exercises.length} hareket`} />
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: '/workout/[id]', params: { id: workout.id } })}
        style={styles.startBtnWrap}
      >
        <LinearGradient
          colors={gradients.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.startBtn}
        >
          <Ionicons name="play" size={16} color={colors.background} />
          <Text style={styles.startLabel}>ANTRENMANA BAŞLA</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
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
      <Ionicons name={icon} size={13} color={colors.accent} />
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    ...shadows.lg,
  },
  glow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: 200,
    borderRadius: 100,
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
    gap: spacing.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  label: {
    ...typography.label,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  flashChip: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    fontSize: 30,
    lineHeight: 34,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
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
    gap: 5,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md - 4,
    paddingVertical: 7,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaValue: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  startBtnWrap: {
    borderRadius: borderRadius.lg,
    ...shadows.accent,
  },
  startBtn: {
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  startLabel: {
    ...typography.label,
    color: colors.background,
    fontWeight: '900',
    letterSpacing: 1.3,
    fontSize: 14,
  },
});
