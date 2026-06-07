import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { useUser } from '@/src/contexts/UserContext';
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  MUSCLE_LABELS,
} from '@/src/constants/strings';
import { getProgramById } from '@/src/data/programs';
import { getWorkoutById } from '@/src/data/workouts';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';

export default function ProgramDetailScreen() {
  const { id }                                           = useLocalSearchParams<{ id: string }>();
  const { activeProgram, startProgram, abandonProgram }  = useUser();
  const program                                          = getProgramById(id ?? '');
  const [expandedWeek, setExpandedWeek]                  = useState<number | null>(1);
  const [starting, setStarting]                          = useState(false);

  if (!program) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Program bulunamadı.</Text>
          <Button title="Geri Dön" onPress={() => router.back()} variant="ghost" />
        </View>
      </SafeAreaView>
    );
  }

  const isThisActive   = activeProgram?.programId === program.id;
  const isThisComplete = isThisActive && !!activeProgram?.completedAt;
  const isOtherActive  = !!activeProgram && !isThisActive;

  const totalSessions = program.weeks.reduce((sum, w) => sum + w.workouts.length, 0);
  const doneSessions  = isThisActive ? activeProgram!.completedSessions.length : 0;
  const progressPct   = isThisActive ? Math.min(1, doneSessions / totalSessions) : 0;

  const handleStart = async () => {
    if (isThisComplete) {
      // Restart a finished program
      Alert.alert(
        'Programı Yeniden Başlat',
        'İlerleme sıfırlanacak ve baştan başlayacaksın. Devam etmek istiyor musun?',
        [
          { text: 'Vazgeç', style: 'cancel' },
          {
            text: 'Yeniden Başla',
            onPress: async () => {
              setStarting(true);
              await abandonProgram();
              await startProgram(program.id);
              setStarting(false);
              goToCurrentWorkout();
            },
          },
        ],
      );
      return;
    }

    if (isOtherActive) {
      Alert.alert(
        'Aktif Program Var',
        'Başka bir programı devam ettiriyorsun. Mevcut programı bırakıp bu programa geçmek istiyor musun?',
        [
          { text: 'Vazgeç', style: 'cancel' },
          {
            text: 'Değiştir',
            style: 'destructive',
            onPress: async () => {
              setStarting(true);
              await abandonProgram();
              await startProgram(program.id);
              setStarting(false);
              goToCurrentWorkout();
            },
          },
        ],
      );
      return;
    }

    setStarting(true);
    await startProgram(program.id);
    setStarting(false);
    goToCurrentWorkout();
  };

  const handleContinue = () => {
    goToCurrentWorkout();
  };

  const goToCurrentWorkout = () => {
    const ap     = activeProgram?.programId === program.id ? activeProgram : { weekNumber: 1, dayIndex: 0 };
    const week   = program.weeks.find((w) => w.weekNumber === (ap?.weekNumber ?? 1));
    const pw     = week?.workouts[ap?.dayIndex ?? 0];
    if (pw) {
      router.push({ pathname: '/workout/[id]', params: { id: pw.workoutId } });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
        <Text style={styles.backLabel}>Programlar</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.categoryRow}>
            <Badge
              label={CATEGORY_LABELS[program.category] ?? program.category}
              variant="accent"
            />
            {program.badge && <Badge label={program.badge} variant="gold" />}
            {isThisActive && <Badge label="AKTİF" variant="accent" />}
          </View>

          <Text style={styles.title}>{program.title}</Text>
          <Text style={styles.description}>{program.description}</Text>
        </View>

        {/* Active / Completed Program Progress */}
        {isThisActive && (
          <View style={[styles.activeCard, isThisComplete && styles.activeCardDone]}>
            <View style={styles.activeCardHeader}>
              <Text style={[styles.activeCardTitle, isThisComplete && styles.activeCardTitleDone]}>
                {isThisComplete ? 'TAMAMLANDI' : 'İlerleme'}
              </Text>
              <Text style={styles.activeCardWeek}>
                Hafta {activeProgram!.weekNumber}/{program.durationWeeks}
              </Text>
            </View>
            <ProgressBar progress={progressPct} height={8} />
            <Text style={styles.activeCardMeta}>
              {doneSessions}/{totalSessions} antrenman · %{Math.round(progressPct * 100)} tamamlandı
            </Text>
          </View>
        )}

        {/* Meta Grid */}
        <View style={styles.metaGrid}>
          <MetaBox icon="calendar-outline" label="Süre"    value={`${program.durationWeeks} hafta`} />
          <MetaBox icon="flash-outline"    label="Seviye"  value={DIFFICULTY_LABELS[program.level]} />
          <MetaBox icon="time-outline"     label="Haftalık" value={`${program.weeklyDays} gün`} />
          <MetaBox
            icon="barbell-outline"
            label="Ekipman"
            value={EQUIPMENT_LABELS[program.equipment[0]] ?? 'Karma'}
          />
        </View>

        {/* Target Muscles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hedef Kaslar</Text>
          <View style={styles.tagRow}>
            {program.targetMuscles.map((m) => (
              <Badge key={m} label={MUSCLE_LABELS[m] ?? m} variant="surface" />
            ))}
          </View>
        </View>

        {/* Equipment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ekipman</Text>
          <View style={styles.tagRow}>
            {program.equipment.map((e) => (
              <Badge key={e} label={EQUIPMENT_LABELS[e] ?? e} variant="surface" />
            ))}
          </View>
        </View>

        {/* Week by Week */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Haftalık Plan</Text>
          {program.weeks.map((week) => {
            const isExpanded = expandedWeek === week.weekNumber;
            const isCurrentWeek =
              isThisActive && activeProgram.weekNumber === week.weekNumber;

            return (
              <View
                key={week.weekNumber}
                style={[styles.weekCard, isCurrentWeek && styles.weekCardActive]}
              >
                <TouchableOpacity
                  style={styles.weekHeader}
                  onPress={() => setExpandedWeek(isExpanded ? null : week.weekNumber)}
                  activeOpacity={0.8}
                >
                  <View style={styles.weekLeft}>
                    <View style={[styles.weekBadge, isCurrentWeek && styles.weekBadgeActive]}>
                      <Text style={[styles.weekBadgeText, isCurrentWeek && styles.weekBadgeTextActive]}>
                        {week.weekNumber}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.weekTitle}>Hafta {week.weekNumber}</Text>
                      {isCurrentWeek && (
                        <Text style={styles.weekCurrentLabel}>Şu anki hafta</Text>
                      )}
                    </View>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.weekContent}>
                    {week.workouts.map((pw, dayIdx) => {
                      const workout      = getWorkoutById(pw.workoutId);
                      const sessionKey   = `W${week.weekNumber}D${dayIdx}`;
                      const isDone       = isThisActive &&
                        activeProgram.completedSessions.includes(sessionKey);
                      const isCurrent    = isCurrentWeek &&
                        activeProgram.dayIndex === dayIdx;

                      return (
                        <TouchableOpacity
                          key={pw.day}
                          style={[styles.workoutRow, isCurrent && styles.workoutRowCurrent]}
                          activeOpacity={0.8}
                          onPress={() =>
                            router.push({ pathname: '/workout/[id]', params: { id: pw.workoutId } })
                          }
                        >
                          <View style={[styles.dayBadge, isDone && styles.dayBadgeDone]}>
                            {isDone ? (
                              <Ionicons name="checkmark" size={16} color={colors.success} />
                            ) : (
                              <Text style={[styles.dayText, isCurrent && styles.dayTextCurrent]}>
                                G{pw.day}
                              </Text>
                            )}
                          </View>
                          <View style={styles.workoutInfo}>
                            <Text style={[styles.workoutName, isCurrent && styles.workoutNameCurrent]}>
                              {pw.name}
                            </Text>
                            {workout && (
                              <Text style={styles.workoutMeta}>
                                {workout.duration} dk · {workout.exercises.length} hareket
                              </Text>
                            )}
                          </View>
                          {isCurrent && (
                            <View style={styles.currentDot} />
                          )}
                          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        {isThisComplete ? (
          <Button
            title="YENİDEN BAŞLA"
            onPress={handleStart}
            fullWidth
            size="lg"
            variant="secondary"
          />
        ) : isThisActive ? (
          <Button
            title="DEVAM ET"
            onPress={handleContinue}
            fullWidth
            size="lg"
          />
        ) : (
          <Button
            title={starting ? 'BAŞLATILIYOR…' : isOtherActive ? 'PROGRAMA GEÇ' : 'PROGRAMA BAŞLA'}
            onPress={handleStart}
            fullWidth
            size="lg"
            disabled={starting}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function MetaBox({
  icon, label, value,
}: {
  icon:  React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={metaStyles.box}>
      <Ionicons name={icon} size={20} color={colors.accent} />
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
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  value: { ...typography.h4, color: colors.text },
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
  scroll:    { flex: 1 },
  content:   { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },
  notFound:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  notFoundText: { ...typography.body, color: colors.textSecondary },

  hero:        { gap: spacing.sm },
  categoryRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  title:       { ...typography.h1, color: colors.text },
  description: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },

  // Active Card
  activeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accent,
    ...shadows.accent,
  },
  activeCardDone:      { borderColor: colors.gold },
  activeCardHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activeCardTitle:     { ...typography.h4, color: colors.text },
  activeCardTitleDone: { color: colors.gold },
  activeCardWeek:      { ...typography.bodySmall, color: colors.accent },
  activeCardMeta:      { ...typography.caption, color: colors.textSecondary },

  metaGrid:    { flexDirection: 'row', gap: spacing.sm },
  section:     { gap: spacing.md },
  sectionTitle:{ ...typography.h4, color: colors.text },
  tagRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },

  weekCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  weekCardActive: { borderColor: colors.accent },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  weekLeft:        { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  weekBadge: {
    width: 32, height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekBadgeActive:    { backgroundColor: colors.accent },
  weekBadgeText:      { ...typography.label, color: colors.accent, fontWeight: '700' },
  weekBadgeTextActive:{ color: colors.background },
  weekTitle:          { ...typography.h4, color: colors.text },
  weekCurrentLabel:   { ...typography.caption, color: colors.accent },
  weekContent:        { borderTopWidth: 1, borderTopColor: colors.border },

  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  workoutRowCurrent:   { backgroundColor: colors.accentMuted },
  dayBadge: {
    width: 36, height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeDone:        { backgroundColor: 'rgba(76,175,80,0.15)' },
  dayText:             { ...typography.label, color: colors.textSecondary, fontWeight: '700' },
  dayTextCurrent:      { color: colors.accent },
  workoutInfo:         { flex: 1 },
  workoutName:         { ...typography.bodyMedium, color: colors.text },
  workoutNameCurrent:  { color: colors.accent },
  workoutMeta:         { ...typography.caption, color: colors.textSecondary },
  currentDot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },

  footer: {
    padding: spacing.md,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
