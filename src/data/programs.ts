import { Program } from '@/src/types';

export const programs: Program[] = [
  {
    id: 'prog_beginner_reset',
    title: 'Başlangıç Tüm Vücut',
    category: 'beginner',
    description:
      'Tüm vücudu güçlendirmek isteyenler için temel başlangıç programı. Doğru hareketleri öğren, kalıcı bir alışkanlık kur.',
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
          { day: 1, workoutId: 'w_full_body_strength', name: 'Tüm Vücut Güç' },
          { day: 3, workoutId: 'w_mobility_core', name: 'Mobilite & Merkez' },
          { day: 5, workoutId: 'w_conditioning', name: 'Kondisyon' },
        ],
      },
      {
        weekNumber: 2,
        workouts: [
          { day: 1, workoutId: 'w_full_body_strength', name: 'Tüm Vücut Güç' },
          { day: 3, workoutId: 'w_core_day1', name: 'Merkez Güç' },
          { day: 5, workoutId: 'w_conditioning', name: 'Kondisyon' },
        ],
      },
      {
        weekNumber: 3,
        workouts: [
          { day: 1, workoutId: 'w_full_body_strength', name: 'Tüm Vücut Güç' },
          { day: 3, workoutId: 'w_mobility_core', name: 'Mobilite & Merkez' },
          { day: 5, workoutId: 'w_fat_burn_strength', name: 'Yağ Yakım Güç' },
        ],
      },
      {
        weekNumber: 4,
        workouts: [
          { day: 1, workoutId: 'w_full_body_strength', name: 'Tüm Vücut Güç' },
          { day: 3, workoutId: 'w_core_day2', name: 'Merkez Dayanıklılık' },
          { day: 5, workoutId: 'w_conditioning', name: 'Kondisyon' },
        ],
      },
    ],
  },
  {
    id: 'prog_fat_burn',
    title: 'Yağ Yakım Programı',
    category: 'fat_burn',
    description:
      'Daha fit ve daha enerjik bir yaşam için hazırlandı. Yüksek tempo, HIIT ve güç kombinasyonuyla maksimum kalori yak.',
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
          { day: 1, workoutId: 'w_fat_burn_hiit', name: 'HIIT Devresi' },
          { day: 2, workoutId: 'w_fat_burn_strength', name: 'Güç Yakım' },
          { day: 4, workoutId: 'w_fat_burn_hiit', name: 'HIIT Devresi' },
          { day: 5, workoutId: 'w_conditioning', name: 'Kondisyon' },
        ],
      },
      {
        weekNumber: 2,
        workouts: [
          { day: 1, workoutId: 'w_fat_burn_hiit', name: 'HIIT Devresi' },
          { day: 2, workoutId: 'w_fat_burn_strength', name: 'Güç Yakım' },
          { day: 4, workoutId: 'w_core_day1', name: 'Merkez Patlama' },
          { day: 5, workoutId: 'w_fat_burn_hiit', name: 'HIIT Devresi' },
        ],
      },
      {
        weekNumber: 3,
        workouts: [
          { day: 1, workoutId: 'w_fat_burn_strength', name: 'Güç Yakım' },
          { day: 2, workoutId: 'w_fat_burn_hiit', name: 'HIIT Devresi' },
          { day: 4, workoutId: 'w_conditioning', name: 'Kondisyon' },
          { day: 5, workoutId: 'w_core_day1', name: 'Merkez Patlama' },
        ],
      },
      {
        weekNumber: 4,
        workouts: [
          { day: 1, workoutId: 'w_fat_burn_hiit', name: 'HIIT Devresi' },
          { day: 2, workoutId: 'w_fat_burn_strength', name: 'Güç Yakım' },
          { day: 4, workoutId: 'w_fat_burn_hiit', name: 'HIIT Devresi' },
          { day: 6, workoutId: 'w_conditioning', name: 'Kondisyon' },
        ],
      },
      {
        weekNumber: 5,
        workouts: [
          { day: 1, workoutId: 'w_fat_burn_strength', name: 'Güç Yakım' },
          { day: 2, workoutId: 'w_fat_burn_hiit', name: 'HIIT Devresi' },
          { day: 4, workoutId: 'w_core_day2', name: 'Merkez Dayanıklılık' },
          { day: 5, workoutId: 'w_fat_burn_hiit', name: 'HIIT Devresi' },
        ],
      },
      {
        weekNumber: 6,
        workouts: [
          { day: 1, workoutId: 'w_fat_burn_hiit', name: 'Final HIIT' },
          { day: 2, workoutId: 'w_fat_burn_strength', name: 'Final Güç' },
          { day: 4, workoutId: 'w_fat_burn_hiit', name: 'Final HIIT' },
          { day: 6, workoutId: 'w_conditioning', name: 'Final Kondisyon' },
        ],
      },
    ],
  },
  {
    id: 'prog_muscle_build',
    title: 'Kas Kazanım Programı',
    category: 'muscle_gain',
    description:
      'Daha güçlü, daha hacimli ve daha disiplinli bir vücut için. Kademeli yüklenme ile sürekli güçlen ve büyü.',
    durationWeeks: 8,
    level: 'intermediate',
    weeklyDays: 4,
    equipment: ['barbell', 'dumbbells', 'machine', 'cables'],
    targetMuscles: ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps'],
    badge: 'En Kapsamlı',
    weeks: [
      {
        weekNumber: 1,
        workouts: [
          { day: 1, workoutId: 'w_upper_body_mass', name: 'Üst Vücut A' },
          { day: 2, workoutId: 'w_lower_body_mass', name: 'Alt Vücut A' },
          { day: 4, workoutId: 'w_upper_body_mass', name: 'Üst Vücut B' },
          { day: 5, workoutId: 'w_lower_body_mass', name: 'Alt Vücut B' },
        ],
      },
      {
        weekNumber: 2,
        workouts: [
          { day: 1, workoutId: 'w_upper_body_mass', name: 'Üst Vücut A' },
          { day: 2, workoutId: 'w_lower_body_mass', name: 'Alt Vücut A' },
          { day: 4, workoutId: 'w_upper_body_mass', name: 'Üst Vücut B' },
          { day: 5, workoutId: 'w_lower_body_mass', name: 'Alt Vücut B' },
        ],
      },
      {
        weekNumber: 3,
        workouts: [
          { day: 1, workoutId: 'w_upper_body_mass', name: 'Üst Vücut A' },
          { day: 2, workoutId: 'w_lower_body_mass', name: 'Alt Vücut A' },
          { day: 4, workoutId: 'w_upper_body_mass', name: 'Üst Vücut B' },
          { day: 5, workoutId: 'w_lower_body_mass', name: 'Alt Vücut B' },
        ],
      },
      {
        weekNumber: 4,
        workouts: [
          { day: 1, workoutId: 'w_upper_body_mass', name: 'Hafif Üst' },
          { day: 3, workoutId: 'w_lower_body_mass', name: 'Hafif Alt' },
          { day: 5, workoutId: 'w_mobility_core', name: 'Aktif Toparlanma' },
        ],
      },
      {
        weekNumber: 5,
        workouts: [
          { day: 1, workoutId: 'w_upper_body_mass', name: 'Üst Vücut A' },
          { day: 2, workoutId: 'w_lower_body_mass', name: 'Alt Vücut A' },
          { day: 4, workoutId: 'w_upper_body_mass', name: 'Üst Vücut B' },
          { day: 5, workoutId: 'w_lower_body_mass', name: 'Alt Vücut B' },
        ],
      },
      {
        weekNumber: 6,
        workouts: [
          { day: 1, workoutId: 'w_upper_body_mass', name: 'Üst Vücut A' },
          { day: 2, workoutId: 'w_lower_body_mass', name: 'Alt Vücut A' },
          { day: 4, workoutId: 'w_upper_body_mass', name: 'Üst Vücut B' },
          { day: 5, workoutId: 'w_lower_body_mass', name: 'Alt Vücut B' },
        ],
      },
      {
        weekNumber: 7,
        workouts: [
          { day: 1, workoutId: 'w_upper_body_mass', name: 'Üst Vücut A' },
          { day: 2, workoutId: 'w_lower_body_mass', name: 'Alt Vücut A' },
          { day: 4, workoutId: 'w_upper_body_mass', name: 'Üst Vücut B' },
          { day: 5, workoutId: 'w_lower_body_mass', name: 'Alt Vücut B' },
        ],
      },
      {
        weekNumber: 8,
        workouts: [
          { day: 1, workoutId: 'w_upper_body_mass', name: 'Final Üst A' },
          { day: 2, workoutId: 'w_lower_body_mass', name: 'Final Alt A' },
          { day: 4, workoutId: 'w_upper_body_mass', name: 'Final Üst B' },
          { day: 5, workoutId: 'w_lower_body_mass', name: 'Final Alt B' },
        ],
      },
    ],
  },
  {
    id: 'prog_core_control',
    title: 'Merkez Bölge Kontrolü',
    category: 'core',
    description:
      'Karın, bel ve merkez bölgeni güçlendir. Her seviyeye uygun; dengeni, duruşunu ve fonksiyonel gücünü sağlamlaştır.',
    durationWeeks: 4,
    level: 'all',
    weeklyDays: 3,
    equipment: ['none'],
    targetMuscles: ['core'],
    weeks: [
      {
        weekNumber: 1,
        workouts: [
          { day: 1, workoutId: 'w_core_day1', name: 'Merkez Güç' },
          { day: 3, workoutId: 'w_core_day2', name: 'Merkez Dayanıklılık' },
          { day: 5, workoutId: 'w_core_day1', name: 'Merkez Güç' },
        ],
      },
      {
        weekNumber: 2,
        workouts: [
          { day: 1, workoutId: 'w_core_day2', name: 'Merkez Dayanıklılık' },
          { day: 3, workoutId: 'w_core_day1', name: 'Merkez Güç' },
          { day: 5, workoutId: 'w_core_day2', name: 'Merkez Dayanıklılık' },
        ],
      },
      {
        weekNumber: 3,
        workouts: [
          { day: 1, workoutId: 'w_core_day1', name: 'Merkez Güç' },
          { day: 3, workoutId: 'w_core_day2', name: 'Merkez Dayanıklılık' },
          { day: 5, workoutId: 'w_core_day1', name: 'Merkez Güç' },
        ],
      },
      {
        weekNumber: 4,
        workouts: [
          { day: 1, workoutId: 'w_core_day1', name: 'Final Merkez Güç' },
          { day: 3, workoutId: 'w_core_day2', name: 'Final Merkez Dayanıklılık' },
          { day: 5, workoutId: 'w_core_day1', name: 'Final Merkez Güç' },
        ],
      },
    ],
  },
  {
    id: 'prog_home_warrior',
    title: 'Evde Savaşçı',
    category: 'home',
    description:
      'Ekipman yok, bahane yok. Evde sıfır ekipmanla güçlen; tek ihtiyacın iraden.',
    durationWeeks: 4,
    level: 'beginner',
    weeklyDays: 4,
    equipment: ['none'],
    targetMuscles: ['full_body', 'core'],
    weeks: [
      {
        weekNumber: 1,
        workouts: [
          { day: 1, workoutId: 'w_home_full_body', name: 'Tüm Vücut A' },
          { day: 2, workoutId: 'w_home_upper', name: 'Üst Vücut' },
          { day: 4, workoutId: 'w_home_full_body', name: 'Tüm Vücut B' },
          { day: 5, workoutId: 'w_core_day1', name: 'Merkez Patlama' },
        ],
      },
      {
        weekNumber: 2,
        workouts: [
          { day: 1, workoutId: 'w_home_full_body', name: 'Tüm Vücut A' },
          { day: 2, workoutId: 'w_home_upper', name: 'Üst Vücut' },
          { day: 4, workoutId: 'w_conditioning', name: 'Kondisyon' },
          { day: 5, workoutId: 'w_core_day2', name: 'Merkez Dayanıklılık' },
        ],
      },
      {
        weekNumber: 3,
        workouts: [
          { day: 1, workoutId: 'w_home_full_body', name: 'Tüm Vücut A' },
          { day: 2, workoutId: 'w_home_upper', name: 'Üst Vücut' },
          { day: 4, workoutId: 'w_home_full_body', name: 'Tüm Vücut B' },
          { day: 5, workoutId: 'w_core_day1', name: 'Merkez Patlama' },
        ],
      },
      {
        weekNumber: 4,
        workouts: [
          { day: 1, workoutId: 'w_home_full_body', name: 'Final Tüm Vücut' },
          { day: 2, workoutId: 'w_home_upper', name: 'Final Üst' },
          { day: 4, workoutId: 'w_conditioning', name: 'Final Kondisyon' },
          { day: 5, workoutId: 'w_core_day1', name: 'Final Merkez' },
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
