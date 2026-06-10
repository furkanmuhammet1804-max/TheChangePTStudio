import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
import { PremiumLockCard } from '@/src/components/premium/PremiumLockCard';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { useUser } from '@/src/contexts/UserContext';
import {
  COACH_NOTES,
  HOME_HEADLINES,
  MUSCLE_LABELS,
  UPGRADE_MESSAGES,
} from '@/src/constants/strings';
import { exercises } from '@/src/data/exercises';
import { getWorkoutById, workouts } from '@/src/data/workouts';
import { borderRadius, colors, gradients, shadows, spacing, typography } from '@/src/theme';
import { MuscleGroup } from '@/src/types';
import { randomFrom } from '@/src/utils/formatters';

export default function HomeScreen() {
  const { isPremium } = useUser();
  return isPremium ? <PremiumHome /> : <FreeHome />;
}

// ─── Free experience: discovery-first, value before paywall ────────────────

const DISCOVER_MUSCLES: { id: MuscleGroup; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { id: 'chest',  icon: 'barbell' },
  { id: 'back',   icon: 'body' },
  { id: 'legs',   icon: 'walk' },
  { id: 'glutes', icon: 'fitness' },
  { id: 'core',   icon: 'flame' },
  { id: 'cardio', icon: 'heart' },
];

function FreeHome() {
  const { profile, favoriteExerciseIds, currentStreak } = useUser();

  const headline  = useMemo(() => randomFrom(HOME_HEADLINES), []);
  const coachNote = useMemo(() => randomFrom(COACH_NOTES), []);
  const firstName = profile?.name?.split(' ')[0] ?? 'Sporcu';

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
            <Text style={styles.greeting}>Merhaba, {firstName}</Text>
            <Text style={styles.subtitle}>{headline}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={16} color={colors.accent} />
            <Text style={styles.streakNum}>{currentStreak}</Text>
            <Text style={styles.streakLabel}>gün seri</Text>
          </View>
        </View>

        {/* Discover hero */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)/exercises')}
          style={styles.discoverWrap}
        >
          <LinearGradient
            colors={gradients.surfaceRaised}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.discoverCard}
          >
            <LinearGradient
              colors={['rgba(197,241,53,0.16)', 'transparent']}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.discoverGlow}
              pointerEvents="none"
            />
            <View style={styles.discoverBadgeRow}>
              <View style={styles.dot} />
              <Text style={styles.discoverEyebrow}>HAREKET KEŞFET</Text>
            </View>
            <Text style={styles.discoverTitle}>Doğru formu öğren</Text>
            <Text style={styles.discoverDesc}>
              {exercises.length} hareket · nasıl yapılır, yaygın hatalar ve alternatifleriyle
            </Text>
            <View style={styles.discoverCtaRow}>
              <View style={styles.discoverCta}>
                <Ionicons name="search" size={15} color={colors.background} />
                <Text style={styles.discoverCtaLabel}>KÜTÜPHANEYİ AÇ</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Muscle group quick links */}
        <SectionHeader title="Kas Grupları" />
        <View style={styles.muscleGrid}>
          {DISCOVER_MUSCLES.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={styles.muscleCell}
              activeOpacity={0.8}
              onPress={() =>
                router.push({ pathname: '/(tabs)/exercises', params: { muscle: m.id } })
              }
            >
              <View style={styles.muscleIconWrap}>
                <Ionicons name={m.icon} size={20} color={colors.accent} />
              </View>
              <Text style={styles.muscleLabel}>{MUSCLE_LABELS[m.id]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Favorites shortcut */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            router.push({ pathname: '/(tabs)/exercises', params: { favorites: '1' } })
          }
          style={styles.favCard}
        >
          <View style={styles.favIcon}>
            <Ionicons name="heart" size={20} color={colors.error} />
          </View>
          <View style={styles.favInfo}>
            <Text style={styles.favTitle}>Favorilerim</Text>
            <Text style={styles.favMeta}>
              {favoriteExerciseIds.length > 0
                ? `${favoriteExerciseIds.length} hareket kaydettin`
                : 'Sevdiğin hareketleri kaydet, hızlıca ulaş'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Locked: today's workout (visible but premium) */}
        <SectionHeader title="Bugünün Antrenmanı" />
        <PremiumLockCard
          title="Günlük antrenman planın seni bekliyor"
          message={UPGRADE_MESSAGES.todayWorkout}
          icon="calendar"
        />

        <View style={styles.section}>
          <CoachNoteCard note={coachNote} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Premium experience: today's workout, program & progress first ─────────

function PremiumHome() {
  const {
    profile,
    activeProgram,
    customProgram,
    getProgram,
    weeklyCompletedCount,
    currentStreak,
  } = useUser();

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
      const program       = getProgram(activeProgram.programId);
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
  }, [activeProgram, profile?.goal, getProgram]);

  const coachNote  = useMemo(() => randomFrom(COACH_NOTES), []);
  const headline   = useMemo(() => randomFrom(HOME_HEADLINES), []);
  const firstName  = profile?.name?.split(' ')[0] ?? 'Sporcu';
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
            <Text style={styles.greeting}>Merhaba, {firstName}</Text>
            <Text style={styles.subtitle}>{headline}</Text>
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
            onPress={() => router.push({ pathname: '/program/[id]', params: { id: activeProgram!.programId } })}
            activeOpacity={0.9}
            style={[styles.programBannerWrap, programContext.isComplete ? shadows.gold : shadows.accent]}
          >
            <LinearGradient
              colors={gradients.surfaceRaised}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.programBanner, programContext.isComplete && styles.programBannerDone]}
            >
            <View style={styles.programBannerLeft}>
              <Text style={[styles.programBannerLabel, programContext.isComplete && styles.programBannerLabelDone]}>
                {programContext.isComplete ? 'PROGRAM TAMAMLANDI' : 'AKTİF PROGRAM'}
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
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Today's Workout */}
        <SectionHeader title={programContext ? 'Bugünün Antrenmanı' : 'Senin İçin Önerilen'} />
        <HeroWorkoutCard workout={featuredWorkout} label="Bugünün Antrenmanı" />

        {/* No active program CTA */}
        {!activeProgram && (
          <TouchableOpacity
            onPress={() => router.push(customProgram ? '/(tabs)/programs' : '/program/create')}
            activeOpacity={0.9}
            style={styles.startProgramWrap}
          >
            <LinearGradient
              colors={gradients.surfaceRaised}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startProgramCta}
            >
              <View style={styles.startProgramIcon}>
                <Ionicons name="rocket" size={22} color={colors.accent} />
              </View>
              <View style={styles.startProgramCtaLeft}>
                <Text style={styles.startProgramCtaTitle}>Sana özel programını oluştur</Text>
                <Text style={styles.startProgramCtaSubtitle}>
                  Hedefine ve seviyene göre, gün gün takip et
                </Text>
              </View>
              <View style={styles.startProgramCtaArrow}>
                <Ionicons name="arrow-forward" size={20} color={colors.background} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Weekly Progress */}
        <View style={styles.section}>
          <SectionHeader title="Bu Haftaki İlerlemen" />
          <WeeklyProgressCard
            completed={weeklyCompletedCount}
            target={weeklyTarget}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Hızlı Erişim" />
          <QuickAccessGrid />
        </View>

        {/* Coach message */}
        <View style={styles.section}>
          <CoachNoteCard note={coachNote} />
        </View>

        {/* Coming soon: AI coach & nutrition */}
        <View style={styles.section}>
          <SectionHeader title="Yakında" />
          <View style={styles.soonRow}>
            <ComingSoonCard icon="sparkles-outline" label="Yapay Zeka Koç" />
            <ComingSoonCard icon="restaurant-outline" label="Beslenme" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ComingSoonCard({
  icon, label,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}) {
  return (
    <View style={styles.soonCard}>
      <View style={styles.soonIcon}>
        <Ionicons name={icon} size={20} color={colors.gold} />
      </View>
      <Text style={styles.soonLabel}>{label}</Text>
      <View style={styles.soonBadge}>
        <Text style={styles.soonBadgeText}>YAKINDA</Text>
      </View>
    </View>
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

  // Free: discover hero
  discoverWrap: { borderRadius: borderRadius.xl, ...shadows.lg },
  discoverCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  discoverGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  discoverBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent },
  discoverEyebrow: {
    ...typography.label,
    color: colors.accent,
    letterSpacing: 1.5,
  },
  discoverTitle: {
    ...typography.h1,
    fontSize: 30,
    lineHeight: 34,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  discoverDesc: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  discoverCtaRow: { flexDirection: 'row' },
  discoverCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md - 2,
    ...shadows.accent,
  },
  discoverCtaLabel: {
    ...typography.label,
    color: colors.background,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  // Free: muscle grid
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  muscleCell: {
    width: '31%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  muscleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muscleLabel: { ...typography.bodySmall, color: colors.text, fontWeight: '600' },

  // Free: favorites shortcut
  favCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  favIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,75,75,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favInfo:  { flex: 1 },
  favTitle: { ...typography.h4, color: colors.text },
  favMeta:  { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },

  // Premium: program banner
  programBannerWrap: {
    borderRadius: borderRadius.lg,
  },
  programBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  programBannerLeft:        { flex: 1, gap: spacing.xs },
  programBannerLabel:       { ...typography.caption, color: colors.accent, letterSpacing: 1 },
  programBannerLabelDone:   { color: colors.gold },
  programBannerDone:        { borderColor: colors.gold },
  programBannerTitle:       { ...typography.h4, color: colors.text },
  programBannerMeta:        { ...typography.bodySmall, color: colors.textSecondary },
  programBannerProgress:    { gap: 4, marginTop: 2 },
  programBannerProgressText:{ ...typography.caption, color: colors.textMuted },

  // Premium: create program CTA
  startProgramWrap: {
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  startProgramCta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.md,
    overflow: 'hidden',
  },
  startProgramIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startProgramCtaLeft:     { flex: 1 },
  startProgramCtaTitle:    { ...typography.h4, color: colors.text },
  startProgramCtaSubtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 3 },
  startProgramCtaArrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.accent,
  },

  // Coming soon
  soonRow: { flexDirection: 'row', gap: spacing.sm },
  soonCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  soonIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soonLabel: { ...typography.bodyMedium, color: colors.text },
  soonBadge: {
    backgroundColor: colors.goldMuted,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  soonBadgeText: { ...typography.caption, color: colors.gold, fontWeight: '800' },

  section: { marginTop: spacing.sm },
});
