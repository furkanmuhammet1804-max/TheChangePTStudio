import { Program } from '@/src/types';

export const programs: Program[] = [
  {
    id: 'prog_beginner_reset',
    title: 'Beginner Full Body Reset',
    category: 'beginner',
    description:
      'Yeni başlayanlar için tüm vücudu dengeli çalıştıran temel program. Temel hareketleri öğren, alışkanlık oluştur.',
    durationWeeks: 4,
    level: 'beginner',
    weeklyDays: 3,
    equipment: ['dumbbells', 'none'],
    targetMuscles: ['full_body', 'core'],
    badge: 'Başlangıç İçin',
    weeks: [
      {
        weekNumber: 1,
        workouts: [
          { day: 1, workoutId: 'w_full_body_strength', name: 'Full Body Strength' },
          { day: 3, workoutId: 'w_mobility_core', name: 'Mobility & Core' },
          { day: 5, workoutId: 'w_conditioning', name: 'Conditioning' },
        ],
      },
      {
        weekNumber: 2,
        workouts: [
          { day: 1, workoutId: 'w_full_body_strength', name: 'Full Body Strength' },
          { day: 3, workoutId: 'w_core_day1', name: 'Core Power' },
          { day: 5, workoutId: 'w_conditioning', name: 'Conditioning' },
        ],
      },
      {
        weekNumber: 3,
        workouts: [
          { day: 1, workoutId: 'w_full_body_strength', name: 'Full Body Strength' },
          { day: 3, workoutId: 'w_mobility_core', name: 'Mobility & Core' },
          { day: 5, workoutId: 'w_fat_burn_strength', name: 'Fat Burn Strength' },
        ],
      },
      {
        weekNumber: 4,
        workouts: [
          { day: 1, workoutId: 'w_full_body_strength', name: 'Full Body Strength' },
          { day: 3, workoutId: 'w_core_day2', name: 'Core Endurance' },
          { day: 5, workoutId: 'w_conditioning', name: 'Conditioning' },
        ],
      },
    ],
  },
  {
    id: 'prog_fat_burn',
    title: 'Fat Burn Express',
    category: 'fat_burn',
    description:
      'Kısa sürede yüksek tempo yağ yakım odaklı program. HIIT ve güç kombinasyonuyla maksimum kalori harca.',
    durationWeeks: 6,
    level: 'intermediate',
    weeklyDays: 4,
    equipment: ['none', 'dumbbells'],
    targetMuscles: ['full_body', 'cardio'],
    badge: 'Popüler',
    weeks: [
      {
        weekNumber: 1,
        workouts: [
          { day: 1, workoutId: 'w_fat_burn_hiit', name: 'HIIT Circuit' },
          { day: 2, workoutId: 'w_fat_burn_strength', name: 'Strength Burn' },
          { day: 4, workoutId: 'w_fat_burn_hiit', name: 'HIIT Circuit' },
          { day: 5, workoutId: 'w_conditioning', name: 'Conditioning' },
        ],
      },
      {
        weekNumber: 2,
        workouts: [
          { day: 1, workoutId: 'w_fat_burn_hiit', name: 'HIIT Circuit' },
          { day: 2, workoutId: 'w_fat_burn_strength', name: 'Strength Burn' },
          { day: 4, workoutId: 'w_core_day1', name: 'Core Blast' },
          { day: 5, workoutId: 'w_fat_burn_hiit', name: 'HIIT Circuit' },
        ],
      },
      {
        weekNumber: 3,
        workouts: [
          { day: 1, workoutId: 'w_fat_burn_strength', name: 'Strength Burn' },
          { day: 2, workoutId: 'w_fat_burn_hiit', name: 'HIIT Circuit' },
          { day: 4, workoutId: 'w_conditioning', name: 'Conditioning' },
          { day: 5, workoutId: 'w_core_day1', name: 'Core Blast' },
        ],
      },
      {
        weekNumber: 4,
        workouts: [
          { day: 1, workoutId: 'w_fat_burn_hiit', name: 'HIIT Circuit' },
          { day: 2, workoutId: 'w_fat_burn_strength', name: 'Strength Burn' },
          { day: 4, workoutId: 'w_fat_burn_hiit', name: 'HIIT Circuit' },
          { day: 6, workoutId: 'w_conditioning', name: 'Conditioning' },
        ],
      },
      {
        weekNumber: 5,
        workouts: [
          { day: 1, workoutId: 'w_fat_burn_strength', name: 'Strength Burn' },
          { day: 2, workoutId: 'w_fat_burn_hiit', name: 'HIIT Circuit' },
          { day: 4, workoutId: 'w_core_day2', name: 'Core Endurance' },
          { day: 5, workoutId: 'w_fat_burn_hiit', name: 'HIIT Circuit' },
        ],
      },
      {
        weekNumber: 6,
        workouts: [
          { day: 1, workoutId: 'w_fat_burn_hiit', name: 'Final HIIT' },
          { day: 2, workoutId: 'w_fat_burn_strength', name: 'Final Strength' },
          { day: 4, workoutId: 'w_fat_burn_hiit', name: 'Final HIIT' },
          { day: 6, workoutId: 'w_conditioning', name: 'Final Conditioning' },
        ],
      },
    ],
  },
  {
    id: 'prog_muscle_build',
    title: 'Muscle Build Foundation',
    category: 'muscle_gain',
    description:
      'Kas kazanımı ve kuvvet artışı için temel salon programı. Progressive overload ile güçlen ve büyü.',
    durationWeeks: 8,
    level: 'intermediate',
    weeklyDays: 4,
    equipment: ['barbell', 'dumbbells', 'machine', 'cables'],
    targetMuscles: ['chest', 'back', 'legs', 'shoulders', 'arms'],
    badge: 'En Kapsamlı',
    weeks: [
      {
        weekNumber: 1,
        workouts: [
          { day: 1, workoutId: 'w_upper_body_mass', name: 'Upper Body A' },
          { day: 2, workoutId: 'w_lower_body_mass', name: 'Lower Body A' },
          { day: 4, workoutId: 'w_upper_body_mass', name: 'Upper Body B' },
          { day: 5, workoutId: 'w_lower_body_mass', name: 'Lower Body B' },
        ],
      },
      {
        weekNumber: 2,
        workouts: [
          { day: 1, workoutId: 'w_upper_body_mass', name: 'Upper Body A' },
          { day: 2, workoutId: 'w_lower_body_mass', name: 'Lower Body A' },
          { day: 4, workoutId: 'w_upper_body_mass', name: 'Upper Body B' },
          { day: 5, workoutId: 'w_lower_body_mass', name: 'Lower Body B' },
        ],
      },
      {
        weekNumber: 3,
        workouts: [
          { day: 1, workoutId: 'w_upper_body_mass', name: 'Upper Body A' },
          { day: 2, workoutId: 'w_lower_body_mass', name: 'Lower Body A' },
          { day: 4, workoutId: 'w_upper_body_mass', name: 'Upper Body B' },
          { day: 5, workoutId: 'w_lower_body_mass', name: 'Lower Body B' },
        ],
      },
      {
        weekNumber: 4,
        workouts: [
          { day: 1, workoutId: 'w_upper_body_mass', name: 'Deload Upper' },
          { day: 3, workoutId: 'w_lower_body_mass', name: 'Deload Lower' },
          { day: 5, workoutId: 'w_mobility_core', name: 'Active Recovery' },
        ],
      },
      {
        weekNumber: 5,
        workouts: [
          { day: 1, workoutId: 'w_upper_body_mass', name: 'Upper Body A' },
          { day: 2, workoutId: 'w_lower_body_mass', name: 'Lower Body A' },
          { day: 4, workoutId: 'w_upper_body_mass', name: 'Upper Body B' },
          { day: 5, workoutId: 'w_lower_body_mass', name: 'Lower Body B' },
        ],
      },
      {
        weekNumber: 6,
        workouts: [
          { day: 1, workoutId: 'w_upper_body_mass', name: 'Upper Body A' },
          { day: 2, workoutId: 'w_lower_body_mass', name: 'Lower Body A' },
          { day: 4, workoutId: 'w_upper_body_mass', name: 'Upper Body B' },
          { day: 5, workoutId: 'w_lower_body_mass', name: 'Lower Body B' },
        ],
      },
      {
        weekNumber: 7,
        workouts: [
          { day: 1, workoutId: 'w_upper_body_mass', name: 'Upper Body A' },
          { day: 2, workoutId: 'w_lower_body_mass', name: 'Lower Body A' },
          { day: 4, workoutId: 'w_upper_body_mass', name: 'Upper Body B' },
          { day: 5, workoutId: 'w_lower_body_mass', name: 'Lower Body B' },
        ],
      },
      {
        weekNumber: 8,
        workouts: [
          { day: 1, workoutId: 'w_upper_body_mass', name: 'Final Upper A' },
          { day: 2, workoutId: 'w_lower_body_mass', name: 'Final Lower A' },
          { day: 4, workoutId: 'w_upper_body_mass', name: 'Final Upper B' },
          { day: 5, workoutId: 'w_lower_body_mass', name: 'Final Lower B' },
        ],
      },
    ],
  },
  {
    id: 'prog_core_control',
    title: 'Core Control',
    category: 'core',
    description:
      'Karın, bel ve merkez bölge güçlendirme programı. Her seviyeye uygun, fonksiyonel güç kazan.',
    durationWeeks: 4,
    level: 'all',
    weeklyDays: 3,
    equipment: ['none'],
    targetMuscles: ['core'],
    weeks: [
      {
        weekNumber: 1,
        workouts: [
          { day: 1, workoutId: 'w_core_day1', name: 'Core Power' },
          { day: 3, workoutId: 'w_core_day2', name: 'Core Endurance' },
          { day: 5, workoutId: 'w_core_day1', name: 'Core Power' },
        ],
      },
      {
        weekNumber: 2,
        workouts: [
          { day: 1, workoutId: 'w_core_day2', name: 'Core Endurance' },
          { day: 3, workoutId: 'w_core_day1', name: 'Core Power' },
          { day: 5, workoutId: 'w_core_day2', name: 'Core Endurance' },
        ],
      },
      {
        weekNumber: 3,
        workouts: [
          { day: 1, workoutId: 'w_core_day1', name: 'Core Power' },
          { day: 3, workoutId: 'w_core_day2', name: 'Core Endurance' },
          { day: 5, workoutId: 'w_core_day1', name: 'Core Power' },
        ],
      },
      {
        weekNumber: 4,
        workouts: [
          { day: 1, workoutId: 'w_core_day1', name: 'Final Core Power' },
          { day: 3, workoutId: 'w_core_day2', name: 'Final Core Endurance' },
          { day: 5, workoutId: 'w_core_day1', name: 'Final Core Power' },
        ],
      },
    ],
  },
  {
    id: 'prog_home_warrior',
    title: 'Home Warrior',
    category: 'home',
    description:
      'Evde sıfır ekipmanla güçlen. Spor salonuna gerek yok, iradenle yeter.',
    durationWeeks: 4,
    level: 'beginner',
    weeklyDays: 4,
    equipment: ['none'],
    targetMuscles: ['full_body', 'core'],
    weeks: [
      {
        weekNumber: 1,
        workouts: [
          { day: 1, workoutId: 'w_home_full_body', name: 'Full Body A' },
          { day: 2, workoutId: 'w_home_upper', name: 'Upper Body' },
          { day: 4, workoutId: 'w_home_full_body', name: 'Full Body B' },
          { day: 5, workoutId: 'w_core_day1', name: 'Core Blast' },
        ],
      },
      {
        weekNumber: 2,
        workouts: [
          { day: 1, workoutId: 'w_home_full_body', name: 'Full Body A' },
          { day: 2, workoutId: 'w_home_upper', name: 'Upper Body' },
          { day: 4, workoutId: 'w_conditioning', name: 'Conditioning' },
          { day: 5, workoutId: 'w_core_day2', name: 'Core Endurance' },
        ],
      },
      {
        weekNumber: 3,
        workouts: [
          { day: 1, workoutId: 'w_home_full_body', name: 'Full Body A' },
          { day: 2, workoutId: 'w_home_upper', name: 'Upper Body' },
          { day: 4, workoutId: 'w_home_full_body', name: 'Full Body B' },
          { day: 5, workoutId: 'w_core_day1', name: 'Core Blast' },
        ],
      },
      {
        weekNumber: 4,
        workouts: [
          { day: 1, workoutId: 'w_home_full_body', name: 'Final Full Body' },
          { day: 2, workoutId: 'w_home_upper', name: 'Final Upper' },
          { day: 4, workoutId: 'w_conditioning', name: 'Final Conditioning' },
          { day: 5, workoutId: 'w_core_day1', name: 'Final Core' },
        ],
      },
    ],
  },
];

export function getProgramById(id: string): Program | undefined {
  return programs.find((p) => p.id === id);
}

export function getProgramsByCategory(category: string): Program[] {
  if (category === 'all') return programs;
  return programs.filter((p) => p.category === category);
}
