import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActiveProgram,
  ExerciseLog,
  ProgressData,
  SetLog,
  UserProfile,
  WeightEntry,
  WorkoutLog,
} from '@/src/types';
import { getProgramById } from '@/src/data/programs';

// ─── Storage keys ──────────────────────────────────────────────────────────
const USER_KEY         = '@tcp_user_profile';
const ONBOARDING_KEY   = '@tcp_onboarding_done';
const PROGRESS_KEY     = '@tcp_progress';
const ACTIVE_PROG_KEY  = '@tcp_active_program';
const WORKOUT_LOGS_KEY = '@tcp_workout_logs';

// ─── Context shape ─────────────────────────────────────────────────────────
interface UserContextType {
  // Auth / profile
  profile:              UserProfile | null;
  isOnboardingComplete: boolean;
  loading:              boolean;
  saveProfile:          (p: UserProfile)   => Promise<void>;
  completeOnboarding:   ()                 => Promise<void>;

  // Legacy weight tracking
  progress:        ProgressData;
  addWeightEntry:  (weight: number) => Promise<void>;

  // Program tracking
  activeProgram:      ActiveProgram | null;
  startProgram:       (programId: string) => Promise<void>;
  advanceProgramDay:  (log: WorkoutLog)   => Promise<void>;
  abandonProgram:     ()                  => Promise<void>;

  // Workout logs
  workoutLogs:         WorkoutLog[];
  saveWorkoutLog:      (log: WorkoutLog)              => Promise<void>;
  getLastExerciseSets: (exerciseId: string)            => SetLog[];
  getExerciseHistory:  (exerciseId: string)            => { date: string; sets: SetLog[] }[];

  // Derived stats
  weeklyCompletedCount: number;
  currentStreak:        number;
  totalWorkouts:        number;

  // Admin
  resetAll: () => Promise<void>;
}

// ─── Defaults ──────────────────────────────────────────────────────────────
const defaultProgress: ProgressData = { weightHistory: [] };

const UserContext = createContext<UserContextType | null>(null);

// ─── Streak helper ─────────────────────────────────────────────────────────
function computeStreak(logs: WorkoutLog[]): number {
  if (logs.length === 0) return 0;
  const uniqueDates = [...new Set(logs.map((l) => l.date))].sort().reverse();
  const today     = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const diff =
      (new Date(uniqueDates[i - 1]).getTime() - new Date(uniqueDates[i]).getTime()) /
      86_400_000;
    if (Math.round(diff) === 1) streak++;
    else break;
  }
  return streak;
}

function getWeekStart(): string {
  const now  = new Date();
  const day  = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff)).toISOString().split('T')[0];
}

// ─── Provider ──────────────────────────────────────────────────────────────
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile,              setProfile]              = useState<UserProfile | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [progress,             setProgress]             = useState<ProgressData>(defaultProgress);
  const [activeProgram,        setActiveProgram]        = useState<ActiveProgram | null>(null);
  const [workoutLogs,          setWorkoutLogs]          = useState<WorkoutLog[]>([]);
  const [loading,              setLoading]              = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [profJ, onbStr, progJ, activePJ, logsJ] = await Promise.all([
        AsyncStorage.getItem(USER_KEY),
        AsyncStorage.getItem(ONBOARDING_KEY),
        AsyncStorage.getItem(PROGRESS_KEY),
        AsyncStorage.getItem(ACTIVE_PROG_KEY),
        AsyncStorage.getItem(WORKOUT_LOGS_KEY),
      ]);
      if (profJ)    setProfile(JSON.parse(profJ));
      if (onbStr === 'true') setIsOnboardingComplete(true);
      if (progJ)    setProgress(JSON.parse(progJ));
      if (activePJ) setActiveProgram(JSON.parse(activePJ));
      if (logsJ)    setWorkoutLogs(JSON.parse(logsJ));
    } catch { /* ignore first-run errors */ } finally {
      setLoading(false);
    }
  }

  // ── Profile ──────────────────────────────────────────────────────────────
  const saveProfile = useCallback(async (p: UserProfile) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(p));
    setProfile(p);
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOnboardingComplete(true);
  }, []);

  // ── Weight entry (legacy) ─────────────────────────────────────────────────
  const addWeightEntry = useCallback(async (weight: number) => {
    const entry: WeightEntry = { date: new Date().toISOString().split('T')[0], weight };
    const updated: ProgressData = { weightHistory: [...progress.weightHistory, entry] };
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
    setProgress(updated);
  }, [progress]);

  // ── Program tracking ──────────────────────────────────────────────────────
  const startProgram = useCallback(async (programId: string) => {
    const ap: ActiveProgram = {
      programId,
      weekNumber: 1,
      dayIndex:   0,
      startedAt:  new Date().toISOString(),
      completedSessions: [],
    };
    await AsyncStorage.setItem(ACTIVE_PROG_KEY, JSON.stringify(ap));
    setActiveProgram(ap);
  }, []);

  const advanceProgramDay = useCallback(async (_log: WorkoutLog) => {
    if (!activeProgram) return;
    if (activeProgram.completedAt) return; // already complete, no-op

    const program = getProgramById(activeProgram.programId);
    if (!program) return;

    const sessionKey = `W${activeProgram.weekNumber}D${activeProgram.dayIndex}`;

    // Deduplication: ignore if this session was already recorded
    if (activeProgram.completedSessions.includes(sessionKey)) return;

    const completedSessions = [...activeProgram.completedSessions, sessionKey];

    // Total sessions across the entire program
    const totalSessions = program.weeks.reduce(
      (sum, w) => sum + w.workouts.length, 0,
    );

    // Program finished — mark complete, freeze position
    if (completedSessions.length >= totalSessions) {
      const updated: ActiveProgram = {
        ...activeProgram,
        completedSessions,
        completedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(ACTIVE_PROG_KEY, JSON.stringify(updated));
      setActiveProgram(updated);
      return;
    }

    // Advance to next session
    const currentWeek    = program.weeks.find((w) => w.weekNumber === activeProgram.weekNumber);
    const isLastDayOfWeek = activeProgram.dayIndex >= (currentWeek?.workouts.length ?? 1) - 1;
    const isLastWeek      = activeProgram.weekNumber >= program.durationWeeks;

    let nextWeek = activeProgram.weekNumber;
    let nextDay  = activeProgram.dayIndex + 1;

    if (isLastDayOfWeek && !isLastWeek) {
      nextWeek = activeProgram.weekNumber + 1;
      nextDay  = 0;
    }

    const updated: ActiveProgram = {
      ...activeProgram,
      weekNumber: nextWeek,
      dayIndex:   nextDay,
      completedSessions,
    };
    await AsyncStorage.setItem(ACTIVE_PROG_KEY, JSON.stringify(updated));
    setActiveProgram(updated);
  }, [activeProgram]);

  const abandonProgram = useCallback(async () => {
    await AsyncStorage.removeItem(ACTIVE_PROG_KEY);
    setActiveProgram(null);
  }, []);

  // ── Workout logs ──────────────────────────────────────────────────────────
  const saveWorkoutLog = useCallback(async (log: WorkoutLog) => {
    const updated = [...workoutLogs, log];
    await AsyncStorage.setItem(WORKOUT_LOGS_KEY, JSON.stringify(updated));
    setWorkoutLogs(updated);
  }, [workoutLogs]);

  const getLastExerciseSets = useCallback((exerciseId: string): SetLog[] => {
    for (let i = workoutLogs.length - 1; i >= 0; i--) {
      const ex = workoutLogs[i].exercises.find((e) => e.exerciseId === exerciseId);
      if (ex && ex.sets.length > 0) return ex.sets;
    }
    return [];
  }, [workoutLogs]);

  const getExerciseHistory = useCallback(
    (exerciseId: string): { date: string; sets: SetLog[] }[] => {
      return workoutLogs
        .filter((log) => log.exercises.some((e) => e.exerciseId === exerciseId))
        .map((log) => ({
          date: log.date,
          sets: log.exercises.find((e) => e.exerciseId === exerciseId)!.sets,
        }));
    },
    [workoutLogs],
  );

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetAll = useCallback(async () => {
    await AsyncStorage.multiRemove([
      USER_KEY, ONBOARDING_KEY, PROGRESS_KEY,
      ACTIVE_PROG_KEY, WORKOUT_LOGS_KEY,
    ]);
    setProfile(null);
    setIsOnboardingComplete(false);
    setProgress(defaultProgress);
    setActiveProgram(null);
    setWorkoutLogs([]);
  }, []);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const weeklyCompletedCount = useMemo(() => {
    const weekStart = getWeekStart();
    return workoutLogs.filter((l) => l.date >= weekStart).length;
  }, [workoutLogs]);

  const currentStreak = useMemo(() => computeStreak(workoutLogs), [workoutLogs]);

  const totalWorkouts = workoutLogs.length;

  // ── Context value ─────────────────────────────────────────────────────────
  const value = useMemo<UserContextType>(
    () => ({
      profile, isOnboardingComplete, loading,
      saveProfile, completeOnboarding,
      progress, addWeightEntry,
      activeProgram, startProgram, advanceProgramDay, abandonProgram,
      workoutLogs, saveWorkoutLog, getLastExerciseSets, getExerciseHistory,
      weeklyCompletedCount, currentStreak, totalWorkouts,
      resetAll,
    }),
    [
      profile, isOnboardingComplete, loading,
      saveProfile, completeOnboarding,
      progress, addWeightEntry,
      activeProgram, startProgram, advanceProgramDay, abandonProgram,
      workoutLogs, saveWorkoutLog, getLastExerciseSets, getExerciseHistory,
      weeklyCompletedCount, currentStreak, totalWorkouts,
      resetAll,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextType {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
}
