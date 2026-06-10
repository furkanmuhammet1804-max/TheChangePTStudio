import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { WorkoutShareCard } from '@/src/components/workout/WorkoutShareCard';
import { useUser } from '@/src/contexts/UserContext';
import { findExerciseById } from '@/src/services/appStore';
import { getWorkoutById } from '@/src/data/workouts';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';
import { Exercise, ExerciseLog, SetLog, WorkoutLog } from '@/src/types';
import { formatSeconds } from '@/src/utils/formatters';
import { hapticConfirm, hapticSuccess, hapticTap, hapticWarning } from '@/src/utils/haptics';
import { confirmAction } from '@/src/utils/notify';

type PlayerState = 'active' | 'resting' | 'done';

interface NextUpInfo { name: string; detail: string }

// ─── Pure helpers (outside component) ────────────────────────────────────────

function buildUpdatedLogs(
  prev: ExerciseLog[],
  exerciseId: string,
  setLog: SetLog,
): ExerciseLog[] {
  const idx = prev.findIndex((e) => e.exerciseId === exerciseId);
  if (idx >= 0) {
    const updated = [...prev];
    updated[idx] = { ...updated[idx], sets: [...updated[idx].sets, setLog] };
    return updated;
  }
  return [...prev, { exerciseId, sets: [setLog] }];
}

function parseWeight(str: string): number | null {
  if (str.trim() === '') return null;
  const v = parseFloat(str);
  return !isNaN(v) && v >= 0 ? v : null;
}

function parseReps(str: string, fallback: number): number {
  const v = parseInt(str, 10);
  return !isNaN(v) && v >= 0 ? v : fallback;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WorkoutPlayerScreen() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const { activeProgram, saveWorkoutLog, advanceProgramDay, getLastExerciseSets, getProgram, isPremium } = useUser();
  const workout = getWorkoutById(workoutId ?? '');

  // ── State ─────────────────────────────────────────────────────────────────
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setNumber, setSetNumber]         = useState(1);
  const [elapsed, setElapsed]             = useState(0);
  const [restTimer, setRestTimer]         = useState(0);
  const [restDuration, setRestDuration]   = useState(60);
  const [playerState, setPlayerState]     = useState<PlayerState>('active');
  const [isPaused, setIsPaused]           = useState(false);
  const [startedAt]                       = useState(() => new Date().toISOString());
  const [exerciseLogs, setExerciseLogs]   = useState<ExerciseLog[]>([]);
  const [currentWeight, setCurrentWeight] = useState('');
  const [currentReps, setCurrentReps]     = useState('');
  const [nextUpInfo, setNextUpInfo]       = useState<NextUpInfo | null>(null);
  const [completedLog, setCompletedLog]   = useState<WorkoutLog | null>(null);
  // Premium: "Hareketi Değiştir" — egzersiz indexi → seçilen alternatif id
  const [exerciseOverrides, setExerciseOverrides] = useState<Record<number, string>>({});
  const [swapModalOpen, setSwapModalOpen] = useState(false);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const elapsedRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const restRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedCountRef = useRef(0);    // always-current elapsed — avoids stale closures
  const isProcessingRef = useRef(false); // double-tap guard

  // ── Derived values ────────────────────────────────────────────────────────
  const totalExercises  = workout?.exercises.length ?? 0;
  const currentWE       = workout?.exercises[exerciseIndex];
  // Alternatifle değiştirilmişse override edilen id kullanılır (loglar da buna yazılır)
  const effectiveExerciseId = exerciseOverrides[exerciseIndex] ?? currentWE?.exerciseId ?? '';
  const currentExercise = findExerciseById(effectiveExerciseId);
  const swapAlternatives: Exercise[] = isPremium
    ? (currentExercise?.alternatives ?? [])
        .map((altId) => findExerciseById(altId))
        .filter((e): e is Exercise => !!e)
    : [];
  const overallProgress =
    totalExercises > 0
      ? (exerciseIndex + (setNumber - 1) / (currentWE?.sets ?? 1)) / totalExercises
      : 0;
  const lastSets          = currentExercise ? getLastExerciseSets(currentExercise.id) : [];
  const lastSetForCurrent = lastSets[setNumber - 1] ?? lastSets[lastSets.length - 1] ?? null;

  // ── Effects ───────────────────────────────────────────────────────────────

  // Pre-populate inputs when exercise/set changes (values are derived from deps)
  useEffect(() => {
    if (lastSetForCurrent) {
      setCurrentWeight(lastSetForCurrent.weight !== null ? String(lastSetForCurrent.weight) : '');
      setCurrentReps(String(lastSetForCurrent.reps));
    } else {
      setCurrentWeight('');
      setCurrentReps(currentWE?.reps?.match(/^\d+/)?.[0] ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseIndex, setNumber]);

  // Elapsed timer
  useEffect(() => {
    if (playerState === 'done') { if (elapsedRef.current) clearInterval(elapsedRef.current); return; }
    if (isPaused)               { if (elapsedRef.current) clearInterval(elapsedRef.current); return; }
    elapsedRef.current = setInterval(() => setElapsed((s) => {
      const next = s + 1;
      elapsedCountRef.current = next; // keep ref in sync
      return next;
    }), 1000);
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current); };
  }, [isPaused, playerState]);

  // Rest timer init
  useEffect(() => {
    if (playerState !== 'resting') return;
    setRestTimer(restDuration);
  }, [playerState, restDuration]);

  // Rest countdown
  useEffect(() => {
    if (playerState !== 'resting') return;
    if (restRef.current) clearInterval(restRef.current);
    restRef.current = setInterval(() => {
      setRestTimer((t) => {
        if (t <= 1) { clearInterval(restRef.current!); setPlayerState('active'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (restRef.current) clearInterval(restRef.current); };
  }, [playerState]);

  // ── Callbacks (ALL hooks must be before any conditional returns) ──────────

  const handleFinish = useCallback(async (finalLogs: ExerciseLog[]) => {
    if (!workout) return;
    if (elapsedRef.current) clearInterval(elapsedRef.current);

    const completedAt = new Date().toISOString();
    const date        = completedAt.split('T')[0];
    const totalVolume = finalLogs.reduce(
      (sum, ex) =>
        sum + ex.sets.reduce((s, set) => {
          const w = set.weight ?? 0;
          return s + (isNaN(w) ? 0 : w) * (isNaN(set.reps) ? 0 : set.reps);
        }, 0),
      0,
    );

    const log: WorkoutLog = {
      id:              `wl_${Date.now()}`,
      workoutId:       workout.id,
      date,
      startedAt,
      completedAt,
      durationSeconds: elapsedCountRef.current, // ref value — never stale
      exercises:       finalLogs,
      totalVolume,
    };

    if (activeProgram) {
      const program = getProgram(activeProgram.programId);
      const week    = program?.weeks.find((w) => w.weekNumber === activeProgram.weekNumber);
      const pw      = week?.workouts[activeProgram.dayIndex];
      if (pw?.workoutId === workout.id) {
        log.programId  = activeProgram.programId;
        log.weekNumber = activeProgram.weekNumber;
        log.dayIndex   = activeProgram.dayIndex;
        await saveWorkoutLog(log);
        await advanceProgramDay(log);
      } else {
        await saveWorkoutLog(log);
      }
    } else {
      await saveWorkoutLog(log);
    }

    setCompletedLog(log);
    setPlayerState('done');
    hapticSuccess(); // antrenman bitti
  }, [workout, startedAt, activeProgram, saveWorkoutLog, advanceProgramDay, getProgram]);

  const handleSetDone = useCallback(() => {
    if (!workout || !currentWE || isProcessingRef.current) return;
    isProcessingRef.current = true;

    const fallbackReps = parseInt(currentWE.reps?.match(/^\d+/)?.[0] ?? '0', 10) || 0;
    const weight       = parseWeight(currentWeight);
    const reps         = parseReps(currentReps, fallbackReps);
    const setLog: SetLog = { setNumber, weight, reps };

    const newLogs        = buildUpdatedLogs(exerciseLogs, effectiveExerciseId, setLog);
    setExerciseLogs(newLogs);

    const isLastSet      = setNumber >= currentWE.sets;
    const isLastExercise = exerciseIndex + 1 >= totalExercises;

    hapticConfirm(); // set tamamlandı

    if (!isLastSet) {
      setNextUpInfo({ name: currentExercise?.name ?? '', detail: `Set ${setNumber + 1}/${currentWE.sets} · ${currentWE.reps}` });
      setRestDuration(currentWE.rest);
      setSetNumber((s) => s + 1);
      setPlayerState('resting');
      isProcessingRef.current = false;
    } else if (!isLastExercise) {
      const nextWE2 = workout.exercises[exerciseIndex + 1];
      const nextEx2 = findExerciseById(nextWE2.exerciseId);
      setNextUpInfo({ name: nextEx2?.name ?? '', detail: `${nextWE2.sets} set · ${nextWE2.reps}` });
      setRestDuration(currentWE.rest);
      setExerciseIndex((i) => i + 1);
      setSetNumber(1);
      setPlayerState('resting');
      isProcessingRef.current = false;
    } else {
      handleFinish(newLogs); // async — isProcessingRef stays true; done screen will block further input
    }
  }, [
    workout, currentWE, setNumber, exerciseIndex, totalExercises, effectiveExerciseId,
    currentWeight, currentReps, exerciseLogs, currentExercise, handleFinish,
  ]);

  const handleSkipRest = useCallback(() => {
    if (restRef.current) clearInterval(restRef.current);
    setPlayerState('active');
  }, []);

  const handleQuit = async () => {
    hapticWarning();
    const ok = await confirmAction(
      'Antrenmandan çıkmak istiyor musun?',
      'Kaydedilmemiş setlerin silinebilir.',
    );
    if (ok) router.back();
  };

  const handleSwapExercise = (alternative: Exercise) => {
    hapticTap();
    setExerciseOverrides((prev) => ({ ...prev, [exerciseIndex]: alternative.id }));
    setSwapModalOpen(false);
  };

  // ── Conditional renders (after ALL hooks) ─────────────────────────────────

  if (!workout) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Antrenman yüklenemedi.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLinkText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── DONE Screen ───────────────────────────────────────────────────────────
  if (playerState === 'done' && completedLog) {
    const totalSets  = completedLog.exercises.reduce((n, ex) => n + ex.sets.length, 0);
    const calorieEst = Math.round(
      workout.calories * (completedLog.durationSeconds / (workout.duration * 60)),
    );

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.doneContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.doneIcon}>
            <Ionicons name="trophy" size={64} color={colors.gold} />
          </View>
          <Text style={styles.doneTitle}>Harika İş!</Text>
          <Text style={styles.doneSubtitle}>Antrenmanı tamamladın.</Text>

          <View style={styles.doneStats}>
            <DoneStat icon="time-outline"    value={formatSeconds(completedLog.durationSeconds)} label="Süre" />
            <DoneStat icon="flame-outline"   value={`~${calorieEst}`}                            label="kcal" />
            <DoneStat icon="barbell-outline" value={String(totalSets)}                            label="Set" />
            {completedLog.totalVolume > 0 && (
              <DoneStat icon="trending-up-outline" value={`${Math.round(completedLog.totalVolume)} kg`} label="Hacim" />
            )}
          </View>

          <WorkoutShareCard log={completedLog} workoutName={workout.name} />

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => router.replace('/(tabs)/progress')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Gelişim ekranına git"
          >
            <Text style={styles.doneBtnLabel}>GELİŞİME GİT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Ana sayfaya dön"
          >
            <Text style={styles.homeLink}>Ana Sayfaya Dön</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── REST Screen ───────────────────────────────────────────────────────────
  if (playerState === 'resting') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.restContainer}>
          <Text style={styles.restLabel}>DİNLENME</Text>
          <View style={styles.restTimerRing}>
            <Text style={styles.restTimer}>{formatSeconds(restTimer)}</Text>
          </View>
          {nextUpInfo && (
            <View style={styles.nextExInfo}>
              <Text style={styles.nextLabel}>SIRA</Text>
              <Text style={styles.nextName}>{nextUpInfo.name}</Text>
              <Text style={styles.nextMeta}>{nextUpInfo.detail}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.skipRestBtn} onPress={handleSkipRest} activeOpacity={0.85}>
            <Ionicons name="play-skip-forward" size={18} color={colors.background} />
            <Text style={styles.skipRestLabel}>MOLAYI ATLA</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── ACTIVE Screen ─────────────────────────────────────────────────────────
  const isLastAction = setNumber === currentWE?.sets && exerciseIndex + 1 === totalExercises;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={handleQuit}
            style={styles.iconBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Antrenmandan çık"
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.timerBox}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.timer}>{formatSeconds(elapsed)}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsPaused((p) => !p)}
            style={styles.iconBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={isPaused ? 'Antrenmana devam et' : 'Antrenmanı duraklat'}
          >
            <Ionicons name={isPaused ? 'play' : 'pause'} size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressWrap}>
          <ProgressBar progress={overallProgress} height={4} />
          <Text style={styles.progressLabel}>
            {exerciseIndex + 1}/{totalExercises} egzersiz · Set {setNumber}/{currentWE?.sets}
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Exercise Header */}
          <View style={styles.exHeader}>
            <Text style={styles.exerciseName}>{currentExercise?.name ?? 'Egzersiz'}</Text>
            <Text style={styles.muscleGroup}>
              {currentExercise?.muscleGroup?.toUpperCase().replace('_', ' ')}
            </Text>
            {swapAlternatives.length > 0 && (
              <TouchableOpacity
                style={styles.swapBtn}
                onPress={() => {
                  hapticTap();
                  setSwapModalOpen(true);
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Hareketi değiştir"
              >
                <Ionicons name="swap-horizontal-outline" size={14} color={colors.accent} />
                <Text style={styles.swapBtnLabel}>Hareketi Değiştir</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Set Badges */}
          <View style={styles.setBadgeRow}>
            <SetBadge label="SET"      value={`${setNumber}/${currentWE?.sets}`} />
            <SetBadge label="HEDEF"    value={currentWE?.reps ?? '—'} accent />
            <SetBadge label="DİNLENME" value={`${currentWE?.rest ?? 60}sn`} />
          </View>

          {/* Last Session Reference */}
          {lastSetForCurrent && (
            <View style={styles.lastSessionRow}>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text style={styles.lastSessionText}>
                Geçen sefer:{' '}
                {lastSetForCurrent.weight !== null ? `${lastSetForCurrent.weight} kg · ` : ''}
                {lastSetForCurrent.reps} tekrar
              </Text>
            </View>
          )}

          {/* Weight & Reps Inputs */}
          <View style={styles.inputSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>AĞIRLIK (kg)</Text>
              <TextInput
                style={styles.input}
                value={currentWeight}
                onChangeText={setCurrentWeight}
                placeholder="—"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                selectionColor={colors.accent}
                returnKeyType="next"
              />
              <Text style={styles.inputHint}>
                {lastSetForCurrent?.weight != null
                  ? `Geçen: ${lastSetForCurrent.weight} kg`
                  : 'Boş bırak = vücut ağırlığı'}
              </Text>
            </View>

            <View style={styles.inputDivider} />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>TEKRAR</Text>
              <TextInput
                style={styles.input}
                value={currentReps}
                onChangeText={setCurrentReps}
                placeholder={currentWE?.reps ?? '—'}
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                selectionColor={colors.accent}
                returnKeyType="done"
              />
              <Text style={styles.inputHint}>
                {lastSetForCurrent
                  ? `Geçen: ${lastSetForCurrent.reps}`
                  : `Hedef: ${currentWE?.reps ?? '—'}`}
              </Text>
            </View>
          </View>

          {/* Notes */}
          {currentWE?.notes && (
            <View style={styles.notesRow}>
              <Ionicons name="information-circle-outline" size={16} color={colors.gold} />
              <Text style={styles.notes}>{currentWE.notes}</Text>
            </View>
          )}

          {/* Next Up */}
          {!isLastAction && (
            <View style={styles.nextExRow}>
              <Text style={styles.nextExLabel}>
                {setNumber < (currentWE?.sets ?? 1)
                  ? `Sonraki set: ${currentExercise?.name} · Set ${setNumber + 1}/${currentWE?.sets}`
                  : exerciseIndex + 1 < totalExercises
                    ? `Sonraki: ${findExerciseById(workout.exercises[exerciseIndex + 1]?.exerciseId)?.name ?? ''}`
                    : ''}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.prevBtn, (exerciseIndex === 0 && setNumber === 1) && styles.btnDisabled]}
            onPress={() => {
              if (setNumber > 1) {
                setSetNumber((s) => s - 1);
              } else if (exerciseIndex > 0) {
                setExerciseIndex((i) => i - 1);
                setSetNumber(workout.exercises[exerciseIndex - 1]?.sets ?? 1);
              }
            }}
            disabled={exerciseIndex === 0 && setNumber === 1}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.doneSetBtn}
            onPress={handleSetDone}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={isLastAction ? 'Antrenmanı bitir' : 'Seti tamamla'}
          >
            <Text style={styles.doneSetLabel}>
              {isLastAction ? 'ANTRENMANI BİTİR' : 'SET TAMAM'}
            </Text>
            <Ionicons name="checkmark" size={20} color={colors.background} />
          </TouchableOpacity>
        </View>

        {/* Hareketi Değiştir (Premium) */}
        <Modal
          visible={swapModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setSwapModalOpen(false)}
        >
          <View style={styles.swapOverlay}>
            <View style={styles.swapBox}>
              <View style={styles.swapHeader}>
                <Text style={styles.swapTitle}>Hareketi Değiştir</Text>
                <TouchableOpacity
                  onPress={() => setSwapModalOpen(false)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Kapat"
                >
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.swapHint}>
                Aynı kas grubunu çalıştıran alternatiflerden birini seç. Setlerin yeni harekete kaydedilir.
              </Text>
              {swapAlternatives.map((alt) => (
                <TouchableOpacity
                  key={alt.id}
                  style={styles.swapOption}
                  onPress={() => handleSwapExercise(alt)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`${alt.name} hareketine geç`}
                >
                  <View style={styles.swapOptionIcon}>
                    <Ionicons name="barbell-outline" size={16} color={colors.accent} />
                  </View>
                  <Text style={styles.swapOptionName}>{alt.name}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SetBadge({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={setBadgeStyles.box}>
      <Text style={setBadgeStyles.label}>{label}</Text>
      <Text style={[setBadgeStyles.value, accent && setBadgeStyles.valueAccent]}>{value}</Text>
    </View>
  );
}

const setBadgeStyles = StyleSheet.create({
  box: {
    flex: 1, backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', gap: 4,
  },
  label:       { ...typography.caption, color: colors.textMuted, letterSpacing: 0.8 },
  value:       { ...typography.h3, color: colors.text },
  valueAccent: { color: colors.accent },
});

function DoneStat({
  icon, value, label,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  label: string;
}) {
  return (
    <View style={doneStatStyles.box}>
      <Ionicons name={icon} size={24} color={colors.accent} />
      <Text style={doneStatStyles.value}>{value}</Text>
      <Text style={doneStatStyles.label}>{label}</Text>
    </View>
  );
}

const doneStatStyles = StyleSheet.create({
  box:   { alignItems: 'center', gap: 4, minWidth: 64 },
  value: { ...typography.h3, color: colors.text },
  label: { ...typography.caption, color: colors.textSecondary },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea:     { flex: 1, backgroundColor: colors.background },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  errorText:    { ...typography.body, color: colors.textSecondary },
  backLinkText: { ...typography.body, color: colors.accent },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  iconBtn:  { padding: spacing.sm },
  timerBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  timer: { ...typography.bodyMedium, color: colors.text },

  progressWrap:  { paddingHorizontal: spacing.md, gap: spacing.xs, marginBottom: spacing.sm },
  progressLabel: { ...typography.caption, color: colors.textMuted, textAlign: 'right' },

  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },

  exHeader:     { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  exerciseName: { ...typography.h2, color: colors.text, textAlign: 'center' },
  muscleGroup:  { ...typography.label, color: colors.textSecondary, letterSpacing: 1 },
  swapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    borderWidth: 1, borderColor: colors.accent, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    backgroundColor: colors.accentSoft, marginTop: spacing.xs,
  },
  swapBtnLabel: { ...typography.caption, color: colors.accent, fontWeight: '700' },

  swapOverlay: {
    flex: 1, backgroundColor: colors.overlayStrong,
    alignItems: 'center', justifyContent: 'center', padding: spacing.lg,
  },
  swapBox: {
    width: '100%', maxWidth: 420,
    backgroundColor: colors.surface, borderRadius: borderRadius.xl,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm,
  },
  swapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  swapTitle:  { ...typography.h3, color: colors.text },
  swapHint:   { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 18 },
  swapOption: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
  },
  swapOptionIcon: {
    width: 30, height: 30, borderRadius: borderRadius.sm,
    backgroundColor: colors.accentMuted, alignItems: 'center', justifyContent: 'center',
  },
  swapOptionName: { ...typography.bodyMedium, color: colors.text, flex: 1 },

  setBadgeRow: { flexDirection: 'row', gap: spacing.sm },

  lastSessionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, justifyContent: 'center' },
  lastSessionText: { ...typography.bodySmall, color: colors.textMuted },

  inputSection: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  inputGroup:   { flex: 1, padding: spacing.md, alignItems: 'center', gap: spacing.xs },
  inputDivider: { width: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  inputLabel:   { ...typography.caption, color: colors.textMuted, letterSpacing: 0.8 },
  input: {
    ...typography.h2, color: colors.accent,
    textAlign: 'center', minWidth: 80, paddingVertical: spacing.sm,
  },
  inputHint: { ...typography.caption, color: colors.textMuted },

  notesRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
    backgroundColor: colors.goldMuted, borderRadius: borderRadius.md, padding: spacing.md,
    borderWidth: 1, borderColor: 'rgba(212,168,67,0.3)',
  },
  notes: { ...typography.bodySmall, color: colors.gold, flex: 1, lineHeight: 20 },

  nextExRow:   { paddingVertical: spacing.sm, alignItems: 'center' },
  nextExLabel: { ...typography.bodySmall, color: colors.textMuted },

  bottomBar: {
    flexDirection: 'row', gap: spacing.md,
    padding: spacing.md, paddingBottom: spacing.lg,
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  prevBtn: {
    width: 52, height: 52, borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  btnDisabled: { opacity: 0.3 },
  doneSetBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, height: 52, backgroundColor: colors.accent,
    borderRadius: borderRadius.md, ...shadows.accent,
  },
  doneSetLabel: { ...typography.label, color: colors.background, fontWeight: '800', letterSpacing: 1 },

  restContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl, padding: spacing.lg,
  },
  restLabel: { ...typography.label, color: colors.textSecondary, letterSpacing: 2 },
  restTimerRing: {
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: colors.accentMuted, borderWidth: 3, borderColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  restTimer:  { fontSize: 72, fontWeight: '900', color: colors.accent, letterSpacing: -3 },
  nextExInfo: { alignItems: 'center', gap: spacing.xs },
  nextLabel:  { ...typography.caption, color: colors.textMuted, letterSpacing: 1 },
  nextName:   { ...typography.h4, color: colors.text },
  nextMeta:   { ...typography.body, color: colors.textSecondary },
  skipRestBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderRadius: borderRadius.full, ...shadows.accent,
  },
  skipRestLabel: { ...typography.label, color: colors.background, fontWeight: '800' },

  doneContainer: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.lg,
  },
  doneIcon: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: colors.goldMuted, alignItems: 'center', justifyContent: 'center',
    ...shadows.gold,
  },
  doneTitle:    { ...typography.hero, color: colors.text, textAlign: 'center' },
  doneSubtitle: { ...typography.body, color: colors.textSecondary },
  doneStats: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl,
    justifyContent: 'center', paddingVertical: spacing.md,
  },
  doneBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xxl, paddingVertical: spacing.md,
    borderRadius: borderRadius.full, ...shadows.accent,
  },
  doneBtnLabel: { ...typography.label, color: colors.background, fontWeight: '800', letterSpacing: 1 },
  homeLink: { ...typography.body, color: colors.textSecondary },
});
