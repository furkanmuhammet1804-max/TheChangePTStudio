/**
 * Veri erişim katmanı (repository pattern).
 *
 * Ekranlar YAZMA işlemlerini bu arayüzler üzerinden yapar; reaktif OKUMA için
 * `useAppState` (src/services/appStore.ts) kullanılır.
 *
 * Bugün: LocalDataSource → appStore (statik katalog + AsyncStorage deltaları).
 * Yarın: aynı arayüzleri uygulayan bir RemoteDataSource (Firebase/Supabase)
 * yazılır ve `getDataSource()` içindeki tek satır değişir — ekranlara dokunulmaz.
 */
import {
  ContentStatus,
  DashboardStats,
  ManagedProgram,
  NotificationCampaign,
  Subscription,
  SubscriptionPlan,
  SubscriptionPlanId,
  UserAccount,
} from '@/src/types/admin';
import { Exercise, Program } from '@/src/types';
import {
  assignProgramToUser,
  cancelPremium,
  computeDashboardStats,
  createExercise,
  createProgram,
  deleteExercise,
  deleteProgram,
  getAppState,
  grantPremium,
  initAppStore,
  ProgramInput,
  setProgramPremium,
  setProgramStatus,
  SUBSCRIPTION_PLANS,
  unassignProgramFromUser,
  updateExercise,
  updateProgram,
} from '@/src/services/appStore';
import { CampaignInput, sendCampaign } from '@/src/services/notificationService';

export { SUBSCRIPTION_PLANS };

// ─── Repository arayüzleri ───────────────────────────────────────────────────

export interface UserRepository {
  listUsers(): Promise<UserAccount[]>;
  getUser(id: string): Promise<UserAccount | undefined>;
  grantPremium(userId: string, planId: SubscriptionPlanId): Promise<Subscription | undefined>;
  cancelPremium(userId: string): Promise<void>;
  assignProgram(userId: string, programId: string): Promise<void>;
  unassignProgram(userId: string, programId: string): Promise<void>;
}

export interface SubscriptionRepository {
  listPlans(): Promise<SubscriptionPlan[]>;
  listSubscriptions(): Promise<Subscription[]>;
}

export interface ExerciseRepository {
  listExercises(): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  createExercise(input: Omit<Exercise, 'id'>): Promise<Exercise>;
  updateExercise(id: string, patch: Partial<Omit<Exercise, 'id'>>): Promise<void>;
  deleteExercise(id: string): Promise<void>;
}

export interface ProgramRepository {
  listPrograms(): Promise<ManagedProgram[]>;
  getProgram(id: string): Promise<Program | undefined>;
  createProgram(input: ProgramInput): Promise<Program>;
  updateProgram(id: string, input: ProgramInput): Promise<void>;
  deleteProgram(id: string): Promise<void>;
  setStatus(id: string, status: ContentStatus): Promise<void>;
  setPremium(id: string, isPremium: boolean): Promise<void>;
}

export interface NotificationRepository {
  listCampaigns(): Promise<NotificationCampaign[]>;
  sendCampaign(input: CampaignInput): Promise<NotificationCampaign>;
}

export interface StatsRepository {
  getDashboardStats(): Promise<DashboardStats>;
}

/** Tüm repository'leri bir arada sunan veri kaynağı */
export interface DataSource {
  init(): Promise<void>;
  users: UserRepository;
  subscriptions: SubscriptionRepository;
  exercises: ExerciseRepository;
  programs: ProgramRepository;
  notifications: NotificationRepository;
  stats: StatsRepository;
}

// ─── Yerel implementasyon (appStore üzerinden) ───────────────────────────────

const localDataSource: DataSource = {
  init: initAppStore,
  users: {
    async listUsers() { return getAppState().users; },
    async getUser(id) { return getAppState().users.find((u) => u.id === id); },
    async grantPremium(userId, planId) { return grantPremium(userId, planId); },
    async cancelPremium(userId) { cancelPremium(userId); },
    async assignProgram(userId, programId) { assignProgramToUser(userId, programId); },
    async unassignProgram(userId, programId) { unassignProgramFromUser(userId, programId); },
  },
  subscriptions: {
    async listPlans() { return SUBSCRIPTION_PLANS; },
    async listSubscriptions() { return getAppState().subscriptions; },
  },
  exercises: {
    async listExercises() { return getAppState().exercises; },
    async getExercise(id) { return getAppState().exercises.find((e) => e.id === id); },
    async createExercise(input) { return createExercise(input); },
    async updateExercise(id, patch) { updateExercise(id, patch); },
    async deleteExercise(id) { deleteExercise(id); },
  },
  programs: {
    async listPrograms() { return getAppState().programs; },
    async getProgram(id) {
      return getAppState().programs.find((m) => m.program.id === id)?.program;
    },
    async createProgram(input) { return createProgram(input); },
    async updateProgram(id, input) { updateProgram(id, input); },
    async deleteProgram(id) { deleteProgram(id); },
    async setStatus(id, status) { setProgramStatus(id, status); },
    async setPremium(id, isPremium) { setProgramPremium(id, isPremium); },
  },
  notifications: {
    async listCampaigns() { return getAppState().campaigns; },
    async sendCampaign(input) { return sendCampaign(input); },
  },
  stats: {
    async getDashboardStats() { return computeDashboardStats(getAppState()); },
  },
};

/** Uygulamanın kullandığı veri kaynağı. Backend hazır olunca burada değişir. */
export function getDataSource(): DataSource {
  return localDataSource;
}
