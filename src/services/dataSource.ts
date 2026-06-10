/**
 * Veri erişim katmanı (repository pattern).
 *
 * Mobil uygulama ve admin panel bu arayüzler üzerinden veriye erişir.
 * Bugün: yerel statik veri + AsyncStorage (LocalDataSource).
 * Yarın: aynı arayüzleri uygulayan bir RemoteDataSource (REST/Supabase vb.)
 * yazılır ve `getDataSource()` içindeki tek satır değişir — ekranlara dokunulmaz.
 */
import {
  DashboardStats,
  NotificationCampaign,
  Subscription,
  SubscriptionPlan,
  UserAccount,
} from '@/src/types/admin';
import { Exercise, Program } from '@/src/types';
import { exercises } from '@/src/data/exercises';
import { programs } from '@/src/data/programs';

// ─── Repository arayüzleri ───────────────────────────────────────────────────

export interface UserRepository {
  listUsers(): Promise<UserAccount[]>;
  getUser(id: string): Promise<UserAccount | undefined>;
}

export interface SubscriptionRepository {
  listPlans(): Promise<SubscriptionPlan[]>;
  listSubscriptions(): Promise<Subscription[]>;
}

export interface ExerciseRepository {
  listExercises(): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
}

export interface ProgramRepository {
  listPrograms(): Promise<Program[]>;
  getProgram(id: string): Promise<Program | undefined>;
}

export interface NotificationRepository {
  listCampaigns(): Promise<NotificationCampaign[]>;
}

export interface StatsRepository {
  getDashboardStats(): Promise<DashboardStats>;
}

/** Tüm repository'leri bir arada sunan veri kaynağı */
export interface DataSource {
  users: UserRepository;
  subscriptions: SubscriptionRepository;
  exercises: ExerciseRepository;
  programs: ProgramRepository;
  notifications: NotificationRepository;
  stats: StatsRepository;
}

// ─── Yerel (offline) implementasyon ─────────────────────────────────────────

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: 'monthly',   label: 'Aylık',   priceTRY: 299,  periodMonths: 1 },
  { id: 'quarterly', label: '3 Aylık', priceTRY: 749,  periodMonths: 3 },
  { id: 'yearly',    label: 'Yıllık',  priceTRY: 2199, periodMonths: 12 },
];

const localDataSource: DataSource = {
  users: {
    // Backend gelene kadar tek cihazlı kullanım — merkezi kullanıcı listesi yok
    async listUsers() { return []; },
    async getUser() { return undefined; },
  },
  subscriptions: {
    async listPlans() { return SUBSCRIPTION_PLANS; },
    async listSubscriptions() { return []; },
  },
  exercises: {
    async listExercises() { return exercises; },
    async getExercise(id) { return exercises.find((e) => e.id === id); },
  },
  programs: {
    async listPrograms() { return programs; },
    async getProgram(id) { return programs.find((p) => p.id === id); },
  },
  notifications: {
    async listCampaigns() { return []; },
  },
  stats: {
    async getDashboardStats() {
      return {
        totalUsers: 0,
        premiumUsers: 0,
        activePrograms: 0,
        totalExercises: exercises.length,
        totalPrograms: programs.length,
        workoutsCompletedToday: 0,
        workoutsCompletedTotal: 0,
      };
    },
  },
};

/** Uygulamanın kullandığı veri kaynağı. Backend hazır olunca burada değişir. */
export function getDataSource(): DataSource {
  return localDataSource;
}
