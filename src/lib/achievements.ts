/**
 * Başarı / rozet sistemi.
 *
 * Rozetler kullanıcının GERÇEK verisinden (antrenman logları, seri, favoriler,
 * program durumu) hesaplanır — ayrı bir kayıt tutulmaz. Backend geldiğinde
 * sunucu tarafında aynı kurallar çalıştırılıp kalıcı "unlockedAt" yazılabilir.
 */
import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { ActiveProgram, WorkoutLog } from '@/src/types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export interface AchievementInput {
  totalWorkouts: number;
  currentStreak: number;
  favoriteCount: number;
  workoutLogs: WorkoutLog[];
  activeProgram: ActiveProgram | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  unlocked: boolean;
}

/** Aynı egzersizde ilk kayda göre daha yüksek ağırlık kaldırıldı mı? */
function hasStrengthGain(logs: WorkoutLog[]): boolean {
  const firstMax = new Map<string, number>();
  for (const log of logs) {
    for (const ex of log.exercises) {
      const max = ex.sets.reduce((m, s) => Math.max(m, s.weight ?? 0), 0);
      if (max <= 0) continue;
      const first = firstMax.get(ex.exerciseId);
      if (first === undefined) {
        firstMax.set(ex.exerciseId, max);
      } else if (max > first) {
        return true;
      }
    }
  }
  return false;
}

export function evaluateAchievements(input: AchievementInput): Achievement[] {
  const { totalWorkouts, currentStreak, favoriteCount, workoutLogs, activeProgram } = input;

  return [
    {
      id: 'first_workout',
      title: 'İlk Antrenman',
      description: 'İlk antrenmanını tamamla',
      icon: 'barbell-outline',
      unlocked: totalWorkouts >= 1,
    },
    {
      id: 'first_favorite',
      title: 'İlk Favori',
      description: 'Bir hareketi favorilerine ekle',
      icon: 'heart-outline',
      unlocked: favoriteCount >= 1,
    },
    {
      id: 'workouts_10',
      title: '10 Antrenman Tamamlandı',
      description: 'Toplam 10 antrenman bitir',
      icon: 'medal-outline',
      unlocked: totalWorkouts >= 10,
    },
    {
      id: 'workouts_30',
      title: '30 Antrenman Tamamlandı',
      description: 'Toplam 30 antrenman bitir',
      icon: 'star-outline',
      unlocked: totalWorkouts >= 30,
    },
    {
      id: 'streak_7',
      title: '7 Günlük Seri',
      description: '7 gün üst üste antrenman yap',
      icon: 'flame-outline',
      unlocked: currentStreak >= 7,
    },
    {
      id: 'streak_30',
      title: '30 Günlük Seri',
      description: '30 gün üst üste antrenman yap',
      icon: 'bonfire-outline',
      unlocked: currentStreak >= 30,
    },
    {
      id: 'first_program',
      title: 'İlk Program Tamamlandı',
      description: 'Bir programı baştan sona bitir',
      icon: 'trophy-outline',
      unlocked: !!activeProgram?.completedAt,
    },
    {
      id: 'strength_gain',
      title: 'Güç Artışı',
      description: 'Aynı harekette ilk kaydından daha ağır kaldır',
      icon: 'trending-up-outline',
      unlocked: hasStrengthGain(workoutLogs),
    },
  ];
}
