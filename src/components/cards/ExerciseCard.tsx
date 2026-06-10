import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Badge } from '@/src/components/ui/Badge';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';
import {
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  MUSCLE_LABELS,
} from '@/src/constants/strings';
import { Exercise, MuscleGroup } from '@/src/types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Distinct color + icon per muscle group for a recognizable premium thumbnail.
const MUSCLE_STYLE: Record<MuscleGroup, { icon: IconName; color: string }> = {
  chest:     { icon: 'barbell',        color: '#FF6B35' },
  back:      { icon: 'body',           color: '#4FC3F7' },
  shoulders: { icon: 'triangle',       color: '#AB47BC' },
  biceps:    { icon: 'barbell',        color: '#EF5350' },
  triceps:   { icon: 'barbell',        color: '#EC407A' },
  legs:      { icon: 'walk',           color: '#26A69A' },
  glutes:    { icon: 'fitness',        color: '#7E57C2' },
  core:      { icon: 'flame',          color: colors.accent },
  cardio:    { icon: 'heart',          color: '#FF4081' },
  mobility:  { icon: 'accessibility',  color: '#FFB74D' },
  full_body: { icon: 'fitness',        color: colors.gold },
};

interface ExerciseCardProps {
  exercise: Exercise;
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const ms = MUSCLE_STYLE[exercise.muscleGroup] ?? { icon: 'fitness' as IconName, color: colors.accent };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: exercise.id } })}
    >
      {/* Thumbnail */}
      <LinearGradient
        colors={[ms.color + '2E', colors.surfaceSecondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.thumb, { borderColor: ms.color + '44' }]}
      >
        <Ionicons name={ms.icon} size={26} color={ms.color} />
      </LinearGradient>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{exercise.name}</Text>
        <Text style={[styles.muscle, { color: ms.color }]}>{MUSCLE_LABELS[exercise.muscleGroup]}</Text>
        <View style={styles.tags}>
          <Badge label={DIFFICULTY_LABELS[exercise.difficulty]} variant="surface" />
          <Badge label={EQUIPMENT_LABELS[exercise.equipment]} variant="surface" />
        </View>
      </View>

      <View style={styles.chevron}>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  thumb: {
    width: 58,
    height: 58,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    ...typography.h4,
    color: colors.text,
  },
  muscle: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 4,
  },
  chevron: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
