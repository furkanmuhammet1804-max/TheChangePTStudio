import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CoachNoteCard } from '@/src/components/home/CoachNoteCard';
import { HeroWorkoutCard } from '@/src/components/home/HeroWorkoutCard';
import { QuickAccessGrid } from '@/src/components/home/QuickAccessGrid';
import { WeeklyProgressCard } from '@/src/components/home/WeeklyProgressCard';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { useUser } from '@/src/contexts/UserContext';
import { COACH_NOTES, GOAL_LABELS } from '@/src/constants/strings';
import { getProgramById } from '@/src/data/programs';
import { getWorkoutById, workouts } from '@/src/data/workouts';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';
import { getDayName, getGreeting, randomFrom } from '@/src/utils/formatters';

export default function HomeScreen() {
  const { profile, activeProgram, weeklyCompletedCount, currentStreak } = useUser();

  // Determine which workout to feature
  const { featuredWorkout, programContext } = useMemo(() => {
    const goalMap: Record<string, string> = {
      fat_burn:    'w_fat_burn_hiit',
      muscle_gain: 'w_upper_body_mass',
      maintain:    'w_conditioning',
      strength:    'w_full_body_strength',
      beginner:    'w_home_full_body',
    };
    const goal     = profile?.goal ?? 'beginner';
    const targetId = goalMap[goal] ?? 'w_full_body_strength';
    const fallback = workouts.find((w) => w.id === targetId) ?? workouts[0];

    if (activeProgram) {
      const program       = getProgramById(activeProgram.programId);
      const totalSessions = program?.weeks.reduce(
        (sum, wk) => sum + wk.workouts.length, 0,
      ) ?? 1;
      const doneSessions  = activeProgram.completedSessions.length;

      // ── Program complete ──
      if (activeProgram.completedAt) {
        return {
          featuredWorkout: fallback,
          programContext: {
            programTitle:  program?.title ?? '',
            weekNumber:    activeProgram.weekNumber,
            dayLabel:      '',
            progress:      1,
            doneSessions:  totalSessions,
            totalSessions,
            isComplete:    true,
          },
        };
      }

      // ── Program in progress ──
      const week = program?.weeks.find((w) => w.weekNumber === activeProgram.weekNumber);
      const pw   = week?.workouts[activeProgram.dayIndex];
      if (pw) {
        const w = getWorkoutById(pw.workoutId);
        if (w) {
          return {
            featuredWorkout: w,
            programContext: {
              programTitle: program?.title ?? '',
              weekNumber:   activeProgram.weekNumber,
              dayLabel:     pw.name,
              progress:     doneSessions / totalSessions,
              doneSessions,
              totalSessions,
              isComplete:   false,
            },
          };
        }
      }
    }

    return {
      featuredWorkout: fallback,
      programContext:  null,
    };
  }, [activeProgram, profile?.goal]);

  const coachNote  = useMemo(() => randomFrom(COACH_NOTES), []);
  const greeting   = getGreeting(profile?.name ?? 'Sporcu');
  const dayName    = getDayName();
  const weeklyTarget = profile?.weeklyDays ?? 3;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.subtitle}>
              {dayName} · {profile ? GOAL_LABELS[profile.goal] : 'Hadi başlayalım'}
            </Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={16} color={colors.accent} />
            <Text style={styles.streakNum}>{currentStreak}</Text>
            <Text style={styles.streakLabel}>gün seri</Text>
          </View>
        </View>

        {/* Active / Completed Program Banner */}
        {programContext && (
          <TouchableOpacity
            style={[styles.programBanner, programContext.isComplete && styles.programBannerDone]}
            onPress={() => router.push({ pathname: '/program/[id]', params: { id: activeProgram!.programId } })}
            activeOpacity={0.85}
          >
            <View style={styles.programBannerLeft}>
              <Text style={[styles.programBannerLabel, programContext.isComplete && styles.programBannerLabelDone]}>
                {programContext.isComplete ? 'PROGRAM TAMAMLANDI 🏆' : 'AKTİF PROGRAM'}
              </Text>
              <Text style={styles.programBannerTitle}>{programContext.programTitle}</Text>
              {!programContext.isComplete && (
                <Text style={styles.programBannerMeta}>
                  Hafta {programContext.weekNumber} · {programContext.dayLabel}
                </Text>
              )}
              <View style={styles.programBannerProgress}>
                <ProgressBar progress={programContext.progress} height={4} />
                <Text style={styles.programBannerProgressText}>
                  {programContext.doneSessions}/{programContext.totalSessions} antrenman
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={programContext.isComplete ? colors.gold : colors.accent} />
          </TouchableOpacity>
        )}

        {/* Today's Workout */}
        <SectionHeader title={programContext ? 'Bugünkü Antrenman' : 'Önerilen'} />
        <HeroWorkoutCard workout={featuredWorkout} />

        {/* No active program CTA */}
        {!activeProgram && (
          <TouchableOpacity
            style={styles.startProgramCta}
            onPress={() => router.push('/(tabs)/programs')}
            activeOpacity={0.85}
          >
            <View style={styles.startProgramCtaLeft}>
              <Text style={styles.startProgramCtaTitle}>Programa Başla</Text>
              <Text style={styles.startProgramCtaSubtitle}>Yapılandırılmış bir program seç ve takip et</Text>
            </View>
            <View style={styles.startProgramCtaArrow}>
              <Ionicons name="arrow-forward" size={20} color={colors.background} />
            </View>
          </TouchableOpacity>
        )}

        {/* Weekly Progress */}
        <View style={styles.section}>
          <SectionHeader title="Haftalık İlerleme" />
          <WeeklyProgressCard
            completed={weeklyCompletedCount}
            target={weeklyTarget}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Hızlı Erişim" />
          <QuickAccessGrid />
        </View>

        <View style={styles.section}>
          <CoachNoteCard note={coachNote} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll:   { flex: 1 },
  content:  { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    paddingTop: spacing.sm,
  },
  headerLeft: { flex: 1 },
  greeting: { ...typography.h2, color: colors.text, marginBottom: 2 },
  subtitle: { ...typography.body, color: colors.textSecondary },

  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentMuted,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  streakNum:   { ...typography.h4, color: colors.accent },
  streakLabel: { ...typography.caption, color: colors.accent, opacity: 0.8 },

  // Active Program Banner
  programBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent,
    gap: spacing.sm,
    ...shadows.accent,
  },
  programBannerLeft:        { flex: 1, gap: spacing.xs },
  programBannerLabel:       { ...typography.caption, color: colors.accent, letterSpacing: 1 },
  programBannerLabelDone:   { color: colors.gold },
  programBannerDone:        { borderColor: colors.gold },
  programBannerTitle:       { ...typography.h4, color: colors.text },
  programBannerMeta:        { ...typography.bodySmall, color: colors.textSecondary },
  programBannerProgress:    { gap: 4, marginTop: 2 },
  programBannerProgressText:{ ...typography.caption, color: colors.textMuted },

  // No program CTA
  startProgramCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  startProgramCtaLeft:     { flex: 1 },
  startProgramCtaTitle:    { ...typography.bodyMedium, color: colors.text },
  startProgramCtaSubtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  startProgramCtaArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  section: { marginTop: spacing.sm },
});
