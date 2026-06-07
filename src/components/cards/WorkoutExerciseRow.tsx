import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '@/src/theme';
import { Exercise, WorkoutExercise } from '@/src/types';

interface WorkoutExerciseRowProps {
  workoutExercise: WorkoutExercise;
  exercise: Exercise;
  index: number;
}

export function WorkoutExerciseRow({
  workoutExercise,
  exercise,
  index,
}: WorkoutExerciseRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.numberBox}>
        <Text style={styles.number}>{index + 1}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{exercise.name}</Text>
        <View style={styles.details}>
          <DetailChip icon="repeat-outline" label={`${workoutExercise.sets} set`} />
          <DetailChip icon="fitness-outline" label={workoutExercise.reps} />
          <DetailChip icon="time-outline" label={`${workoutExercise.rest}sn`} />
        </View>
        {workoutExercise.notes && (
          <Text style={styles.notes}>{workoutExercise.notes}</Text>
        )}
      </View>
    </View>
  );
}

function DetailChip({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={11} color={colors.accent} />
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  numberBox: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  number: {
    ...typography.label,
    color: colors.accent,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  details: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  chipLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  notes: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
