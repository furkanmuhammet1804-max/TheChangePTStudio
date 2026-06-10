/**
 * Admin panel veri modelleri.
 *
 * Mobil uygulama ve admin panel AYNI veri yapısını kullanır.
 * Şu an backend yok — tüm tipler ileride bir API'ye (REST/Supabase/Firebase)
 * bağlanacak şekilde id + timestamp alanlarıyla tasarlandı.
 */
import { MembershipTier, Program, UserProfile } from '@/src/types';

// ─── Kullanıcılar ────────────────────────────────────────────────────────────

export type UserStatus = 'active' | 'suspended' | 'deleted';

/** Listeleme/filtreleme için türetilmiş üyelik durumu */
export type AdminUserTier = 'free' | 'premium' | 'expired';

/** Mobilden senkronlanan aktivite özeti — admin kullanıcı detayında gösterilir */
export interface UserActivityStats {
  totalWorkouts: number;
  currentStreak: number;
  weeklyWorkouts: number;
  favoriteCount: number;
  lastWorkoutAt?: string; // ISO timestamp
  activeProgramId?: string;
  /** Son tamamlanan antrenmanlar (en yeni başta) */
  recentWorkouts: {
    date: string;            // "YYYY-MM-DD"
    workoutId: string;
    durationSeconds: number;
    totalVolume: number;
  }[];
}

/** Admin panelin gördüğü kullanıcı kaydı. Mobildeki UserProfile'ı sarmalar. */
export interface UserAccount {
  id: string;
  email?: string;
  profile: UserProfile;
  membership: MembershipTier;
  status: UserStatus;
  createdAt: string;     // ISO timestamp
  lastActiveAt?: string; // ISO timestamp
  /** Admin tarafından atanan program id'leri */
  assignedProgramIds: string[];
  stats?: UserActivityStats;
  /** Bu cihazda oturum açmış (mobil uygulamayı kullanan) kullanıcı */
  isDevice?: boolean;
}

// ─── Premium üyelikler ───────────────────────────────────────────────────────

export type SubscriptionPlanId = 'monthly' | 'quarterly' | 'yearly';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'trial';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  label: string;
  priceTRY: number;
  periodMonths: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: SubscriptionPlanId;
  status: SubscriptionStatus;
  startedAt: string;   // ISO timestamp
  expiresAt: string;   // ISO timestamp
  autoRenew: boolean;
}

// ─── İçerik yönetimi (program & egzersiz) ────────────────────────────────────

export type ContentStatus = 'draft' | 'published' | 'archived';

/** Admin panelde yönetilen içerik meta verisi */
export interface ProgramMeta {
  status: ContentStatus;
  /** Sadece premium üyelere atanabilir / görünür */
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Admin tarafında program kaydı = mobildeki Program + yönetim meta */
export interface ManagedProgram {
  program: Program;
  meta: ProgramMeta;
}

// ─── Bildirim yönetimi ───────────────────────────────────────────────────────

export type NotificationAudience = 'all' | 'free' | 'premium';
export type NotificationStatus = 'draft' | 'scheduled' | 'sent' | 'cancelled';

export interface NotificationCampaign {
  id: string;
  title: string;
  body: string;
  audience: NotificationAudience;
  status: NotificationStatus;
  scheduledAt?: string; // ISO timestamp
  sentAt?: string;      // ISO timestamp
  createdAt: string;
  /** Gönderim anındaki hedef kitle büyüklüğü */
  reach: number;
}

// ─── Uygulama ayarları ───────────────────────────────────────────────────────

export interface AppSettings {
  companyName: string;
  adminEmail: string;
  appVersion: string;
  /** Ödeme sağlayıcı (İyzico/RevenueCat) bağlı mı */
  paymentsEnabled: boolean;
  /** Push bildirim servisi bağlı mı */
  pushEnabled: boolean;
  /** Son içerik değişikliği (egzersiz/program) zamanı */
  lastContentSyncAt: string | null;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  expiredUsers: number;
  publishedPrograms: number;
  totalPrograms: number;
  totalExercises: number;
  workoutsCompletedTotal: number;
}
