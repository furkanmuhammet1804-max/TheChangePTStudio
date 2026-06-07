import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WorkoutExerciseRow } from '@/src/components/cards/WorkoutExerciseRow';
import { Button } from '@/src/components/ui/Button';
import { DIFFICULTY_LABELS } from '@/src/constants/strings';
import { getExerciseById } from '@/src/data/exercises';
import { getWorkoutById } from '@/src/data/workouts';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';
import { formatDuration } from '@/src/utils/formatters';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = getWorkoutById(id ?? '');

  if (!workout) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Antrenman bulunamadı.</Text>
          <Button title="Geri Dön" onPress={() => router.back()} variant="ghost" />
        </View>
      </SafeAreaView>
    );
  }

  const handleStart = () => {
    router.push({ pathname: '/workout/player', params: { workoutId: workout.id } });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
        <Text style={styles.backLabel}>Geri</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.title}>{workout.name}</Text>
          <Text style={styles.description}>{workout.description}</Text>
        </View>

        {/* Meta Row */}
        <View style={styles.metaRow}>
          <MetaBadge icon="time-outline" value={formatDuration(workout.duration)} label="Süre" />
          <MetaBadge icon="flame-outline" value={`~${workout.calories}`} label="kcal" />
          <MetaBadge icon="flash-outline" value={DIFFICULTY_LABELS[workout.difficulty]} label="Seviye" />
          <MetaBadge
            icon="barbell-outline"
            value={String(workout.exercises.length)}
            label="Hareket"
          />
        </View>

        {/* Exercise List */}
        <View style={styles.exerciseSection}>
          <Text style={styles.sectionTitle}>Hareketler</Text>

          {workout.exercises.map((we, i) => {
            const exercise = getExerciseById(we.exerciseId);
            if (!exercise) return null;
            return (
              <WorkoutExerciseRow
                key={`${we.exerciseId}-${i}`}
                workoutExercise={we}
                exercise={exercise}
                index={i}
              />
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="ANTRENMANI BAŞLAT" onPress={handleStart} fullWidth size="lg" />
      </View>
    </SafeAreaView>
  );
}

function MetaBadge({
  icon,
  value,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  label: string;
}) {
  return (
    <View style={metaStyles.box}>
      <Ionicons name={icon} size={22} color={colors.accent} />
      <Text style={metaStyles.value}>{value}</Text>
      <Text style={metaStyles.label}>{label}</Text>
    </View>
  );
}

const metaStyles = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  value: { ...typography.h4, color: colors.text, textAlign: 'center' },
  label: { ...typography.caption, color: colors.textSecondary },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  backLabel: { ...typography.body, color: colors.text },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  notFoundText: { ...typography.body, color: colors.textSecondary },
  hero: { gap: spacing.sm },
  title: { ...typography.h1, color: colors.text },
  description: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },
  metaRow: { flexDirection: 'row', gap: spacing.sm },
  exerciseSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  sectionTitle: { ...typography.h4, color: colors.text, marginBottom: spacing.md },
  footer: {
    padding: spacing.md,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
