/**
 * Admin panel veri modelleri.
 *
 * Mobil uygulama ve gelecekteki admin panel AYNI veri yapısını kullanır.
 * Şu an backend yok — tüm tipler ileride bir API'ye (REST/Supabase/Firebase)
 * bağlanacak şekilde id + timestamp alanlarıyla tasarlandı.
 */
import { MembershipTier, Program, UserProfile } from '@/src/types';

// ─── Kullanıcılar ────────────────────────────────────────────────────────────

export type UserStatus = 'active' | 'suspended' | 'deleted';

/** Admin panelin gördüğü kullanıcı kaydı. Mobildeki UserProfile'ı sarmalar. */
export interface UserAccount {
  id: string;
  email?: string;
  profile: UserProfile;
  membership: MembershipTier;
  status: UserStatus;
  createdAt: string;     // ISO timestamp
  lastActiveAt?: string; // ISO timestamp
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
export interface ContentMeta {
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string; // admin kullanıcı id
}

/** Admin tarafında program kaydı = mobildeki Program + yönetim meta */
export interface ManagedProgram extends ContentMeta {
  program: Program;
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
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  premiumUsers: number;
  activePrograms: number;
  totalExercises: number;
  totalPrograms: number;
  workoutsCompletedToday: number;
  workoutsCompletedTotal: number;
}
