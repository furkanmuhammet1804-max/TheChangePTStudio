export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'cardio'
  | 'mobility'
  | 'full_body';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'all';

export type Equipment =
  | 'none'
  | 'dumbbells'
  | 'barbell'
  | 'kettlebell'
  | 'machine'
  | 'cables'
  | 'resistance_bands'
  | 'trx'
  | 'pull_up_bar'
  | 'mixed';

/** Where an exercise can be performed */
export type Environment = 'home' | 'gym' | 'outdoor' | 'travel';

/** Egzersiz medya hazırlık durumu — admin panelden yüklenen içeriğe göre türetilir */
export type MediaStatus = 'missing' | 'image_ready' | 'gif_ready' | 'video_ready';

/** Membership tier — gates program & progress features */
export type MembershipTier = 'free' | 'premium';

export type ProgramCategory =
  | 'all'
  | 'fat_burn'
  | 'muscle_gain'
  | 'full_body'
  | 'core'
  | 'home'
  | 'gym'
  | 'beginner';

export type UserGoal =
  | 'fat_burn'
  | 'muscle_gain'
  | 'maintain'
  | 'strength'
  | 'beginner';

export type Gender = 'male' | 'female' | 'other';
export type TrainingLocation = 'home' | 'gym' | 'mixed';
export type WeeklyDays = 2 | 3 | 4 | 5;

// ─── Exercise & Workout ────────────────────────────────────────────────────

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  difficulty: Difficulty;
  equipment: Equipment;
  environments: Environment[];
  description: string;
  howTo: string[];
  tips: string[];
  commonMistakes: string[];
  alternatives: string[];
  sets?: number;
  reps?: string;
  rest?: number;
  imageUrl?: string;
  gifUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  /** Açıkça belirtilmezse URL alanlarından türetilir (bkz. src/lib/media.ts) */
  mediaStatus?: MediaStatus;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  rest: number;
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  duration: number;
  calories: number;
  difficulty: Difficulty;
  description: string;
  exercises: WorkoutExercise[];
}

// ─── Program ───────────────────────────────────────────────────────────────

export interface ProgramWorkout {
  day: number;
  workoutId: string;
  name: string;
}

export interface ProgramWeek {
  weekNumber: number;
  workouts: ProgramWorkout[];
}

export interface Program {
  id: string;
  title: string;
  category: ProgramCategory;
  description: string;
  durationWeeks: number;
  level: Difficulty;
  weeklyDays: WeeklyDays;
  equipment: Equipment[];
  targetMuscles: MuscleGroup[];
  weeks: ProgramWeek[];
  badge?: string;
  /** True for the user's generated personal program (premium) */
  isCustom?: boolean;
}

// ─── User ──────────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  age: number;
  height: number;
  weight: number;
  gender: Gender;
  goal: UserGoal;
  weeklyDays: WeeklyDays;
  trainingLocation: TrainingLocation;
  level: Difficulty;
  startingWeight: number;
  targetWeight: number;
  createdAt: string;
}

// ─── Workout Logging ───────────────────────────────────────────────────────

/** One completed set: what weight + how many reps */
export interface SetLog {
  setNumber: number;
  weight: number | null; // null = bodyweight / time-based
  reps: number;          // for time-based = seconds
}

/** All logged sets for one exercise in a session */
export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
}

/** Full record of a completed workout session */
export interface WorkoutLog {
  id: string;
  workoutId: string;
  programId?: string;
  weekNumber?: number;
  dayIndex?: number;
  date: string;           // "YYYY-MM-DD"
  startedAt: string;      // ISO timestamp
  completedAt: string;    // ISO timestamp
  durationSeconds: number;
  exercises: ExerciseLog[];
  totalVolume: number;    // sum of weight * reps across all sets
}

// ─── Active Program ────────────────────────────────────────────────────────

/** The program the user is currently enrolled in + position */
export interface ActiveProgram {
  programId: string;
  weekNumber: number;          // 1-based
  dayIndex: number;            // 0-based index within week.workouts
  startedAt: string;           // ISO timestamp
  completedSessions: string[]; // "W{week}D{day}" keys of done sessions
  completedAt?: string;        // ISO timestamp — set when all sessions are done
}

// ─── Transformation (önce/sonra) ────────────────────────────────────────────

/** Önce/sonra fotoğrafı — upload backend'i bağlandığında uri uzak URL olur */
export interface TransformationPhoto {
  id: string;
  type: 'before' | 'after';
  uri: string;
  takenAt: string; // ISO timestamp
}

// ─── Bildirim tercihleri ────────────────────────────────────────────────────

/** Yerel bildirim türleri — push backend bağlandığında aynı anahtarlar kullanılır */
export type NotificationKind =
  | 'workout_reminder'
  | 'premium_renewal'
  | 'new_program'
  | 'motivation'
  | 'admin_announcement';

export interface NotificationPreferences {
  workoutReminders: boolean;
  motivation: boolean;
  productNews: boolean; // yeni program + admin duyuruları
}

// ─── Legacy (kept for migration compat) ────────────────────────────────────

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface ProgressData {
  weightHistory: WeightEntry[];
}
