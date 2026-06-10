/**
 * Yerel veri kaynağının ilk açılış (seed) kayıtları.
 *
 * Backend bağlandığında bu modül tamamen kalkar; appStore aynı verileri
 * uzak API'den çeker. Tarihler "şimdiye göre" üretilir ki panel her zaman
 * canlı görünsün.
 */
import {
  NotificationCampaign,
  Subscription,
  UserAccount,
} from '@/src/types/admin';
import { Difficulty, Gender, TrainingLocation, UserGoal, UserProfile, WeeklyDays } from '@/src/types';

const daysAgo = (days: number, hours = 0): string =>
  new Date(Date.now() - days * 86_400_000 - hours * 3_600_000).toISOString();

const daysFromNow = (days: number): string =>
  new Date(Date.now() + days * 86_400_000).toISOString();

function profile(
  name: string,
  age: number,
  height: number,
  weight: number,
  gender: Gender,
  goal: UserGoal,
  weeklyDays: WeeklyDays,
  trainingLocation: TrainingLocation,
  level: Difficulty,
  targetWeight: number,
  createdAt: string,
): UserProfile {
  return {
    name, age, height, weight, gender, goal, weeklyDays,
    trainingLocation, level,
    startingWeight: weight,
    targetWeight,
    createdAt,
  };
}

export function buildSeedUsers(): UserAccount[] {
  return [
    {
      id: 'u_001',
      email: 'ahmet.yilmaz@gmail.com',
      profile: profile('Ahmet Yılmaz', 29, 181, 84, 'male', 'muscle_gain', 4, 'gym', 'intermediate', 88, daysAgo(120)),
      membership: 'premium',
      status: 'active',
      createdAt: daysAgo(120),
      lastActiveAt: daysAgo(0, 2),
      assignedProgramIds: ['prog_muscle_build'],
      stats: {
        totalWorkouts: 46, currentStreak: 4, weeklyWorkouts: 3, favoriteCount: 8,
        lastWorkoutAt: daysAgo(0, 3),
        activeProgramId: 'prog_muscle_build',
        recentWorkouts: [
          { date: daysAgo(0).slice(0, 10), workoutId: 'w_full_body_strength', durationSeconds: 2700, totalVolume: 6400 },
          { date: daysAgo(2).slice(0, 10), workoutId: 'w_core_day1', durationSeconds: 2100, totalVolume: 1800 },
        ],
      },
    },
    {
      id: 'u_002',
      email: 'elif.demir@hotmail.com',
      profile: profile('Elif Demir', 25, 166, 61, 'female', 'fat_burn', 3, 'home', 'beginner', 56, daysAgo(45)),
      membership: 'free',
      status: 'active',
      createdAt: daysAgo(45),
      lastActiveAt: daysAgo(0, 5),
      assignedProgramIds: [],
      stats: {
        totalWorkouts: 12, currentStreak: 2, weeklyWorkouts: 2, favoriteCount: 5,
        lastWorkoutAt: daysAgo(1),
        recentWorkouts: [
          { date: daysAgo(1).slice(0, 10), workoutId: 'w_conditioning', durationSeconds: 1800, totalVolume: 0 },
        ],
      },
    },
    {
      id: 'u_003',
      email: 'mehmet.kaya@gmail.com',
      profile: profile('Mehmet Kaya', 34, 176, 79, 'male', 'strength', 4, 'gym', 'advanced', 82, daysAgo(210)),
      membership: 'premium',
      status: 'active',
      createdAt: daysAgo(210),
      lastActiveAt: daysAgo(1),
      assignedProgramIds: [],
      stats: {
        totalWorkouts: 88, currentStreak: 0, weeklyWorkouts: 2, favoriteCount: 11,
        lastWorkoutAt: daysAgo(1),
        recentWorkouts: [
          { date: daysAgo(1).slice(0, 10), workoutId: 'w_full_body_strength', durationSeconds: 3100, totalVolume: 8900 },
        ],
      },
    },
    {
      id: 'u_004',
      email: 'zeynep.sahin@gmail.com',
      profile: profile('Zeynep Şahin', 31, 170, 66, 'female', 'fat_burn', 3, 'mixed', 'intermediate', 60, daysAgo(160)),
      membership: 'free',
      status: 'active',
      createdAt: daysAgo(160),
      lastActiveAt: daysAgo(3),
      assignedProgramIds: [],
      stats: {
        totalWorkouts: 31, currentStreak: 0, weeklyWorkouts: 0, favoriteCount: 4,
        lastWorkoutAt: daysAgo(9),
        recentWorkouts: [],
      },
    },
    {
      id: 'u_005',
      email: 'burak.celik@outlook.com',
      profile: profile('Burak Çelik', 22, 184, 72, 'male', 'beginner', 3, 'home', 'beginner', 78, daysAgo(20)),
      membership: 'free',
      status: 'active',
      createdAt: daysAgo(20),
      lastActiveAt: daysAgo(7),
      assignedProgramIds: [],
      stats: { totalWorkouts: 3, currentStreak: 0, weeklyWorkouts: 0, favoriteCount: 2, recentWorkouts: [] },
    },
    {
      id: 'u_006',
      email: 'selin.arslan@gmail.com',
      profile: profile('Selin Arslan', 27, 162, 55, 'female', 'maintain', 3, 'gym', 'intermediate', 55, daysAgo(95)),
      membership: 'premium',
      status: 'active',
      createdAt: daysAgo(95),
      lastActiveAt: daysAgo(0, 1),
      assignedProgramIds: ['prog_core_control'],
      stats: {
        totalWorkouts: 39, currentStreak: 6, weeklyWorkouts: 3, favoriteCount: 7,
        lastWorkoutAt: daysAgo(0, 4),
        activeProgramId: 'prog_core_control',
        recentWorkouts: [
          { date: daysAgo(0).slice(0, 10), workoutId: 'w_core_day1', durationSeconds: 1900, totalVolume: 1200 },
        ],
      },
    },
    {
      id: 'u_007',
      email: 'emre.dogan@gmail.com',
      profile: profile('Emre Doğan', 38, 178, 90, 'male', 'muscle_gain', 2, 'gym', 'beginner', 86, daysAgo(60)),
      membership: 'free',
      status: 'active',
      createdAt: daysAgo(60),
      lastActiveAt: daysAgo(2),
      assignedProgramIds: [],
      stats: { totalWorkouts: 9, currentStreak: 1, weeklyWorkouts: 1, favoriteCount: 3, lastWorkoutAt: daysAgo(2), recentWorkouts: [] },
    },
    {
      id: 'u_008',
      email: 'ayse.koc@icloud.com',
      profile: profile('Ayşe Koç', 41, 158, 70, 'female', 'beginner', 2, 'home', 'beginner', 63, daysAgo(190)),
      membership: 'free',
      status: 'active',
      createdAt: daysAgo(190),
      lastActiveAt: daysAgo(14),
      assignedProgramIds: [],
      stats: { totalWorkouts: 17, currentStreak: 0, weeklyWorkouts: 0, favoriteCount: 1, lastWorkoutAt: daysAgo(20), recentWorkouts: [] },
    },
    {
      id: 'u_009',
      email: 'can.ozturk@gmail.com',
      profile: profile('Can Öztürk', 30, 175, 77, 'male', 'fat_burn', 5, 'mixed', 'intermediate', 72, daysAgo(75)),
      membership: 'premium',
      status: 'active',
      createdAt: daysAgo(75),
      lastActiveAt: daysAgo(0, 4),
      assignedProgramIds: ['prog_fat_burn'],
      stats: {
        totalWorkouts: 52, currentStreak: 9, weeklyWorkouts: 4, favoriteCount: 9,
        lastWorkoutAt: daysAgo(0, 6),
        activeProgramId: 'prog_fat_burn',
        recentWorkouts: [
          { date: daysAgo(0).slice(0, 10), workoutId: 'w_fat_burn_strength', durationSeconds: 2400, totalVolume: 3300 },
        ],
      },
    },
    {
      id: 'u_010',
      email: 'merve.aydin@gmail.com',
      profile: profile('Merve Aydın', 26, 168, 59, 'female', 'maintain', 3, 'home', 'beginner', 58, daysAgo(8)),
      membership: 'free',
      status: 'active',
      createdAt: daysAgo(8),
      lastActiveAt: daysAgo(1),
      assignedProgramIds: [],
      stats: { totalWorkouts: 2, currentStreak: 0, weeklyWorkouts: 1, favoriteCount: 2, lastWorkoutAt: daysAgo(1), recentWorkouts: [] },
    },
  ];
}

export function buildSeedSubscriptions(): Subscription[] {
  return [
    { id: 'sub_001', userId: 'u_001', planId: 'quarterly', status: 'active',  startedAt: daysAgo(40),  expiresAt: daysFromNow(50),  autoRenew: true },
    { id: 'sub_002', userId: 'u_003', planId: 'yearly',    status: 'active',  startedAt: daysAgo(200), expiresAt: daysFromNow(165), autoRenew: true },
    { id: 'sub_003', userId: 'u_006', planId: 'monthly',   status: 'active',  startedAt: daysAgo(12),  expiresAt: daysFromNow(18),  autoRenew: false },
    { id: 'sub_004', userId: 'u_009', planId: 'quarterly', status: 'active',  startedAt: daysAgo(70),  expiresAt: daysFromNow(20),  autoRenew: true },
    // Süresi dolmuş üyelikler — "expired" filtresi ve dashboard kartı için
    { id: 'sub_005', userId: 'u_004', planId: 'monthly',   status: 'expired', startedAt: daysAgo(70),  expiresAt: daysAgo(40),      autoRenew: false },
    { id: 'sub_006', userId: 'u_008', planId: 'quarterly', status: 'expired', startedAt: daysAgo(150), expiresAt: daysAgo(60),      autoRenew: false },
  ];
}

export function buildSeedCampaigns(): NotificationCampaign[] {
  return [
    {
      id: 'camp_001',
      title: 'Yeni kalça egzersizleri eklendi',
      body: 'Kütüphaneye Hip Thrust, Glute Bridge ve daha fazlası eklendi. Hemen keşfet!',
      audience: 'all',
      status: 'sent',
      createdAt: daysAgo(2),
      sentAt: daysAgo(2),
      reach: 10,
    },
    {
      id: 'camp_002',
      title: "Premium'a özel: kişisel program",
      body: 'Hedefine özel programını oluştur, gelişimini adım adım takip et.',
      audience: 'free',
      status: 'sent',
      createdAt: daysAgo(5),
      sentAt: daysAgo(5),
      reach: 6,
    },
    {
      id: 'camp_003',
      title: 'Haftalık motivasyon',
      body: 'Disiplin bugün, sonuç yarın. Bu haftaki antrenmanlarını planladın mı?',
      audience: 'all',
      status: 'sent',
      createdAt: daysAgo(8),
      sentAt: daysAgo(8),
      reach: 10,
    },
  ];
}
