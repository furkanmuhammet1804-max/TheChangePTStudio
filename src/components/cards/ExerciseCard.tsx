import { Ionicons } from '@expo/vector-icons';
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
import { Exercise } from '@/src/types';

const MUSCLE_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  chest: 'body-outline',
  back: 'body-outline',
  shoulders: 'body-outline',
  arms: 'body-outline',
  legs: 'body-outline',
  core: 'body-outline',
  cardio: 'flame-outline',
  mobility: 'accessibility-outline',
  full_body: 'body-outline',
};

interface ExerciseCardProps {
  exercise: Exercise;
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        router.push({ pathname: '/exercise/[id]', params: { id: exercise.id } })
      }
    >
      <View style={styles.iconBox}>
        <Ionicons
          name={MUSCLE_ICONS[exercise.muscleGroup] ?? 'body-outline'}
          size={28}
          color={colors.accent}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{exercise.name}</Text>
        <Text style={styles.muscle}>{MUSCLE_LABELS[exercise.muscleGroup]}</Text>
        <View style={styles.tags}>
          <Badge label={DIFFICULTY_LABELS[exercise.difficulty]} variant="surface" />
          <Badge label={EQUIPMENT_LABELS[exercise.equipment]} variant="surface" />
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.sm,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    ...typography.h4,
    color: colors.text,
  },
  muscle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 2,
  },
});
