import {
  Difficulty,
  Program,
  ProgramCategory,
  ProgramWeek,
  TrainingLocation,
  UserGoal,
  WeeklyDays,
} from '@/src/types';
import { getWorkoutById } from '@/src/data/workouts';

export const CUSTOM_PROGRAM_ID = 'prog_custom_personal';

export interface ProgramInput {
  name: string;
  goal: UserGoal;
  level: Difficulty;
  weeklyDays: WeeklyDays;
  trainingLocation: TrainingLocation;
}

// Ordered workout pools per location+goal. The first `weeklyDays` entries
// become the user's weekly schedule.
const HOME_TEMPLATES: Record<UserGoal, string[]> = {
  fat_burn:    ['w_fat_burn_hiit', 'w_home_full_body', 'w_conditioning', 'w_core_day1', 'w_fat_burn_hiit'],
  muscle_gain: ['w_home_full_body', 'w_home_upper', 'w_home_full_body', 'w_core_day1', 'w_conditioning'],
  maintain:    ['w_home_full_body', 'w_conditioning', 'w_mobility_core', 'w_home_upper', 'w_core_day2'],
  strength:    ['w_home_full_body', 'w_home_upper', 'w_core_day1', 'w_home_full_body', 'w_conditioning'],
  beginner:    ['w_home_full_body', 'w_mobility_core', 'w_conditioning', 'w_home_upper', 'w_core_day1'],
};

const GYM_TEMPLATES: Record<UserGoal, string[]> = {
  fat_burn:    ['w_fat_burn_hiit', 'w_fat_burn_strength', 'w_conditioning', 'w_core_day1', 'w_fat_burn_hiit'],
  muscle_gain: ['w_upper_body_mass', 'w_lower_body_mass', 'w_upper_body_mass', 'w_lower_body_mass', 'w_core_day1'],
  maintain:    ['w_full_body_strength', 'w_conditioning', 'w_mobility_core', 'w_upper_body_mass', 'w_core_day2'],
  strength:    ['w_full_body_strength', 'w_lower_body_mass', 'w_upper_body_mass', 'w_full_body_strength', 'w_core_day1'],
  beginner:    ['w_full_body_strength', 'w_mobility_core', 'w_conditioning', 'w_core_day1', 'w_fat_burn_strength'],
};

// Which weekdays the sessions land on, per training frequency
const DAY_SPREAD: Record<WeeklyDays, number[]> = {
  2: [1, 4],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 4, 6],
};

const GOAL_CATEGORY: Record<UserGoal, ProgramCategory> = {
  fat_burn:    'fat_burn',
  muscle_gain: 'muscle_gain',
  maintain:    'full_body',
  strength:    'full_body',
  beginner:    'beginner',
};

const GOAL_TARGET_MUSCLES: Record<UserGoal, Program['targetMuscles']> = {
  fat_burn:    ['full_body', 'cardio'],
  muscle_gain: ['chest', 'back', 'legs', 'shoulders'],
  maintain:    ['full_body', 'core'],
  strength:    ['full_body', 'legs'],
  beginner:    ['full_body', 'core'],
};

const GOAL_DESCRIPTIONS: Record<UserGoal, string> = {
  fat_burn:    'Yağ yakımına odaklanan, sana özel hazırlanmış yüksek tempolu program.',
  muscle_gain: 'Kas kütleni artırmak için sana özel hazırlanmış kademeli yüklenme programı.',
  maintain:    'Formunu korumak için dengeli, sana özel hazırlanmış program.',
  strength:    'Gücünü artırmak için sana özel hazırlanmış temel kuvvet programı.',
  beginner:    'Temelden başlayıp alışkanlık kurman için sana özel hazırlanmış program.',
};

const DURATION_WEEKS = 4;

/**
 * Builds a personal 4-week program from the user's profile inputs.
 * Pure and deterministic — same inputs always produce the same plan.
 */
export function generatePersonalProgram(input: ProgramInput): Program {
  const useGym   = input.trainingLocation !== 'home';
  const template = (useGym ? GYM_TEMPLATES : HOME_TEMPLATES)[input.goal];
  const schedule = template.slice(0, input.weeklyDays);
  const days     = DAY_SPREAD[input.weeklyDays];

  const weeks: ProgramWeek[] = Array.from({ length: DURATION_WEEKS }, (_, i) => ({
    weekNumber: i + 1,
    workouts: schedule.map((workoutId, idx) => ({
      day: days[idx],
      workoutId,
      name: getWorkoutById(workoutId)?.name ?? 'Antrenman',
    })),
  }));

  const equipment: Program['equipment'] = useGym ? ['mixed'] : ['none'];

  return {
    id: CUSTOM_PROGRAM_ID,
    title: `${input.name.split(' ')[0]} İçin Özel Program`,
    category: GOAL_CATEGORY[input.goal],
    description: GOAL_DESCRIPTIONS[input.goal],
    durationWeeks: DURATION_WEEKS,
    level: input.level,
    weeklyDays: input.weeklyDays,
    equipment,
    targetMuscles: GOAL_TARGET_MUSCLES[input.goal],
    weeks,
    badge: 'Sana Özel',
    isCustom: true,
  };
}
