/**
 * Ortak veri deposu — mobil uygulama ve admin panelin TEK veri kaynağı.
 *
 * Mimari:
 *  - Statik katalog (src/data) + AsyncStorage'da tutulan deltalar (eklenen,
 *    düzenlenen, silinen kayıtlar) birleştirilerek "merged" koleksiyonlar üretilir.
 *  - Ekranlar `useAppState(selector)` ile reaktif okur; yazma işlemleri
 *    src/services/dataSource.ts üzerinden bu modüldeki aksiyonlara gelir.
 *
 * CANLI mod (.env'de Supabase tanımlı):
 *  - Açılışta içerik (egzersiz/program) ve yönetim verisi (kullanıcı/üyelik/
 *    kampanya) Supabase'ten yüklenir; statik katalog yerine DB tek kaynaktır
 *    (katalog 0002_seed_catalog.sql ile DB'ye taşınır).
 *  - Yazma aksiyonları önce yerel state'i (iyimser) günceller, ardından
 *    Supabase'e yazar; realtime aboneliği diğer cihazlardaki değişiklikleri
 *    anında getirir. Ekran kodu iki modda da AYNIDIR.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { isSupabaseConfigured } from '@/src/lib/supabase';
import { getAuthState, initAuth, subscribeAuth } from '@/src/services/authService';
import {
  fetchAdminData,
  fetchRemoteContent,
  pushAssignProgram,
  pushCampaign,
  pushCancelPremium,
  pushExerciseDelete,
  pushExerciseUpsert,
  pushGrantPremium,
  pushProgramDelete,
  pushProgramUpsert,
  pushUnassignProgram,
  RemoteContent,
  subscribeRealtime,
} from '@/src/services/remoteData';
import { exercises as exerciseCatalog } from '@/src/data/exercises';
import { programs as programCatalog } from '@/src/data/programs';
import { workouts as workoutCatalog } from '@/src/data/workouts';
import {
  LEGACY_DEMO_CAMPAIGN_IDS,
  LEGACY_DEMO_SUBSCRIPTION_IDS,
  LEGACY_DEMO_USER_IDS,
} from '@/src/data/seed';
import {
  AdminUserTier,
  AppSettings,
  ContentStatus,
  DashboardStats,
  ManagedProgram,
  NotificationCampaign,
  ProgramMeta,
  Subscription,
  SubscriptionPlan,
  SubscriptionPlanId,
  UserAccount,
  UserActivityStats,
} from '@/src/types/admin';
import {
  Exercise,
  MembershipTier,
  Program,
  ProgramWeek,
  UserProfile,
} from '@/src/types';

// ─── Sabitler ────────────────────────────────────────────────────────────────

const STORE_KEY = '@tcp_app_store_v1';

/** Bu cihazda uygulamayı kullanan kullanıcının sabit hesabı */
export const DEVICE_USER_ID = 'u_device';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: 'monthly',   label: 'Aylık',   priceTRY: 299,  periodMonths: 1 },
  { id: 'quarterly', label: '3 Aylık', priceTRY: 749,  periodMonths: 3 },
  { id: 'yearly',    label: 'Yıllık',  priceTRY: 2199, periodMonths: 12 },
];

const DEFAULT_SETTINGS: AppSettings = {
  companyName: 'The Change PT Studio',
  adminEmail: 'admin@thechangept.com',
  appVersion: '1.0.0',
  paymentsEnabled: false,
  pushEnabled: false,
  lastContentSyncAt: null,
};

/** Statik katalog kayıtları için varsayılan oluşturulma zamanı */
const CATALOG_TIMESTAMP = '2026-01-01T00:00:00.000Z';

// ─── State şekli ─────────────────────────────────────────────────────────────

/** AsyncStorage'a yazılan kısım — sadece deltalar ve canlı kayıtlar */
interface PersistedState {
  users: UserAccount[];
  subscriptions: Subscription[];
  campaigns: NotificationCampaign[];
  customExercises: Exercise[];
  updatedExercises: Record<string, Exercise>;
  deletedExerciseIds: string[];
  customPrograms: Program[];
  updatedPrograms: Record<string, Program>;
  deletedProgramIds: string[];
  programMeta: Record<string, ProgramMeta>;
  settings: AppSettings;
}

export interface AppState extends PersistedState {
  ready: boolean;
  /** Katalog + deltalardan türetilen birleşik egzersiz listesi */
  exercises: Exercise[];
  /** Katalog + deltalardan türetilen birleşik program listesi (meta ile) */
  programs: ManagedProgram[];
}

function emptyPersisted(): PersistedState {
  return {
    users: [],
    subscriptions: [],
    campaigns: [],
    customExercises: [],
    updatedExercises: {},
    deletedExerciseIds: [],
    customPrograms: [],
    updatedPrograms: {},
    deletedProgramIds: [],
    programMeta: {},
    settings: { ...DEFAULT_SETTINGS },
  };
}

// ─── Canlı mod (Supabase) ────────────────────────────────────────────────────

/** Canlı modda Supabase'ten yüklenen içerik — set edildiğinde tek kaynaktır */
let remoteContent: RemoteContent | null = null;

function isRemote(): boolean {
  return isSupabaseConfigured();
}

// ─── Merge (katalog + delta / canlı içerik) ──────────────────────────────────

function mergeExercises(s: PersistedState): Exercise[] {
  if (remoteContent) return remoteContent.exercises;
  return mergeLocalExercises(s);
}

function mergePrograms(s: PersistedState): ManagedProgram[] {
  if (remoteContent) return remoteContent.programs;
  return mergeLocalPrograms(s);
}

function mergeLocalExercises(s: PersistedState): Exercise[] {
  const deleted = new Set(s.deletedExerciseIds);
  const fromCatalog = exerciseCatalog
    .filter((e) => !deleted.has(e.id))
    .map((e) => s.updatedExercises[e.id] ?? e);
  return [...fromCatalog, ...s.customExercises.filter((e) => !deleted.has(e.id))];
}

function defaultProgramMeta(): ProgramMeta {
  return {
    status: 'published',
    isPremium: true,
    createdAt: CATALOG_TIMESTAMP,
    updatedAt: CATALOG_TIMESTAMP,
  };
}

function mergeLocalPrograms(s: PersistedState): ManagedProgram[] {
  const deleted = new Set(s.deletedProgramIds);
  const fromCatalog = programCatalog
    .filter((p) => !deleted.has(p.id))
    .map((p) => ({
      program: s.updatedPrograms[p.id] ?? p,
      meta: s.programMeta[p.id] ?? defaultProgramMeta(),
    }));
  const custom = s.customPrograms
    .filter((p) => !deleted.has(p.id))
    .map((p) => ({
      program: p,
      meta: s.programMeta[p.id] ?? defaultProgramMeta(),
    }));
  return [...fromCatalog, ...custom];
}

// ─── Store çekirdeği ─────────────────────────────────────────────────────────

let state: AppState = {
  ...emptyPersisted(),
  ready: false,
  exercises: mergeExercises(emptyPersisted()),
  programs: mergePrograms(emptyPersisted()),
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getAppState(): AppState {
  return state;
}

export function subscribeAppStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Reaktif okuma — selector state alanı döndürmeli (referans kararlılığı için) */
export function useAppState<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribeAppStore,
    () => selector(state),
    () => selector(state),
  );
}

async function persist() {
  if (isRemote()) return; // canlı modda tek kaynak Supabase'tir; yerel delta yazılmaz
  try {
    const persisted: PersistedState = {
      users: state.users,
      subscriptions: state.subscriptions,
      campaigns: state.campaigns,
      customExercises: state.customExercises,
      updatedExercises: state.updatedExercises,
      deletedExerciseIds: state.deletedExerciseIds,
      customPrograms: state.customPrograms,
      updatedPrograms: state.updatedPrograms,
      deletedProgramIds: state.deletedProgramIds,
      programMeta: state.programMeta,
      settings: state.settings,
    };
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(persisted));
  } catch {
    // Yerel yazma hatası uygulamayı durdurmasın
  }
}

function update(patch: Partial<PersistedState>) {
  const next: AppState = { ...state, ...patch };
  next.exercises = mergeExercises(next);
  next.programs = mergePrograms(next);
  state = next;
  emit();
  void persist();
}

// ─── Başlatma ────────────────────────────────────────────────────────────────

let initPromise: Promise<void> | null = null;

export function initAppStore(): Promise<void> {
  if (!initPromise) initPromise = doInit();
  return initPromise;
}

async function doInit() {
  if (isRemote()) {
    await initRemote();
    return;
  }

  let persisted: PersistedState | null = null;
  try {
    const raw = await AsyncStorage.getItem(STORE_KEY);
    if (raw) persisted = { ...emptyPersisted(), ...JSON.parse(raw) };
  } catch {
    persisted = null;
  }

  if (!persisted) persisted = emptyPersisted();

  // Önceki sürümlerin yazdığı demo kullanıcı/abonelik/kampanya kayıtlarını
  // temizle — gerçek (cihazda oluşturulmuş) kayıtlar korunur.
  persisted = {
    ...persisted,
    users: persisted.users.filter((u) => !LEGACY_DEMO_USER_IDS.has(u.id)),
    subscriptions: persisted.subscriptions.filter(
      (s) => !LEGACY_DEMO_SUBSCRIPTION_IDS.has(s.id) && !LEGACY_DEMO_USER_IDS.has(s.userId),
    ),
    campaigns: persisted.campaigns.filter((c) => !LEGACY_DEMO_CAMPAIGN_IDS.has(c.id)),
    // Demo kullanıcılara yapılmış program atamaları da geçersiz — kullanıcılar zaten silindi
  };

  // Süresi geçmiş abonelikleri kapat, üyelikleri düşür
  const reconciled = reconcileSubscriptions(persisted);

  state = {
    ...reconciled,
    ready: true,
    exercises: mergeExercises(reconciled),
    programs: mergePrograms(reconciled),
  };
  emit();
  void persist();
}

// ─── Canlı mod başlatma / senkron ────────────────────────────────────────────

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

/** Realtime olayları üst üste gelebilir — 400ms toparlanarak tek fetch yapılır */
function scheduleRemoteRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    refreshTimer = null;
    void refreshRemote();
  }, 400);
}

/** Supabase'ten içerik + yönetim verisini çekip state'e yazar */
async function refreshRemote(): Promise<void> {
  try {
    const [content, admin] = await Promise.all([fetchRemoteContent(), fetchAdminData()]);
    remoteContent = content;
    update({
      users: admin.users,
      subscriptions: admin.subscriptions,
      campaigns: admin.campaigns,
    });
  } catch (err) {
    console.warn('[appStore] Supabase verisi alınamadı (yerel veriyle devam):', err);
  }
}

async function initRemote(): Promise<void> {
  // Oturum geri yüklenmeden RLS doğru satırları veremez
  try {
    await initAuth();
  } catch {
    // auth başlatılamasa da içerik (anonim okunabilir) denenir
  }

  await refreshRemote();

  state = { ...state, ready: true };
  emit();

  // Diğer cihazlardaki değişiklikleri canlı izle
  try {
    subscribeRealtime(scheduleRemoteRefresh);
  } catch (err) {
    console.warn('[appStore] Realtime aboneliği kurulamadı:', err);
  }

  // Giriş/çıkışta görünür veri kümesi değişir (RLS) — yeniden çek
  subscribeAuth(scheduleRemoteRefresh);
}

/** Bitiş tarihi geçen aktif abonelikleri expire eder ve üyeliği günceller */
function reconcileSubscriptions(s: PersistedState): PersistedState {
  const now = Date.now();
  let changed = false;

  const subscriptions = s.subscriptions.map((sub) => {
    if (sub.status === 'active' && new Date(sub.expiresAt).getTime() < now) {
      changed = true;
      return { ...sub, status: 'expired' as const };
    }
    return sub;
  });

  if (!changed) return s;

  const hasActive = (userId: string) =>
    subscriptions.some((sub) => sub.userId === userId && sub.status === 'active');

  const users = s.users.map((u) =>
    u.membership === 'premium' && !hasActive(u.id)
      ? { ...u, membership: 'free' as const }
      : u,
  );

  return { ...s, subscriptions, users };
}

// ─── Yardımcı seçiciler ──────────────────────────────────────────────────────

export function findExerciseById(id: string): Exercise | undefined {
  return state.exercises.find((e) => e.id === id);
}

export function findProgramById(id: string): Program | undefined {
  return state.programs.find((m) => m.program.id === id)?.program;
}

/** Kullanıcının listeleme/filtre amaçlı türetilmiş üyelik durumu */
export function getUserTier(user: UserAccount, subscriptions: Subscription[]): AdminUserTier {
  if (user.membership === 'premium') return 'premium';
  const hadSubscription = subscriptions.some(
    (s) => s.userId === user.id && (s.status === 'expired' || s.status === 'cancelled'),
  );
  return hadSubscription ? 'expired' : 'free';
}

/** Kullanıcının en güncel aboneliği (varsa) */
export function getLatestSubscription(
  userId: string,
  subscriptions: Subscription[],
): Subscription | undefined {
  return [...subscriptions]
    .filter((s) => s.userId === userId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
}

export function computeDashboardStats(s: AppState): DashboardStats {
  const premiumUsers = s.users.filter((u) => u.membership === 'premium').length;
  const expiredUsers = s.users.filter(
    (u) => getUserTier(u, s.subscriptions) === 'expired',
  ).length;
  return {
    totalUsers: s.users.length,
    premiumUsers,
    freeUsers: s.users.length - premiumUsers - expiredUsers,
    expiredUsers,
    publishedPrograms: s.programs.filter((m) => m.meta.status === 'published').length,
    totalPrograms: s.programs.length,
    totalExercises: s.exercises.length,
    workoutsCompletedTotal: s.users.reduce(
      (sum, u) => sum + (u.stats?.totalWorkouts ?? 0),
      0,
    ),
  };
}

// ─── Egzersiz aksiyonları ────────────────────────────────────────────────────

function touchContent(): Pick<PersistedState, 'settings'> {
  return {
    settings: { ...state.settings, lastContentSyncAt: new Date().toISOString() },
  };
}

export function createExercise(input: Omit<Exercise, 'id'>): Exercise {
  const exercise: Exercise = { ...input, id: `ex_custom_${Date.now()}` };
  if (remoteContent) {
    remoteContent = { ...remoteContent, exercises: [...remoteContent.exercises, exercise] };
    update({ ...touchContent() });
    pushExerciseUpsert(exercise);
    return exercise;
  }
  update({
    customExercises: [...state.customExercises, exercise],
    ...touchContent(),
  });
  return exercise;
}

export function updateExercise(id: string, patch: Partial<Omit<Exercise, 'id'>>): void {
  const current = findExerciseById(id);
  if (!current) return;
  const next: Exercise = { ...current, ...patch, id };

  if (remoteContent) {
    remoteContent = {
      ...remoteContent,
      exercises: remoteContent.exercises.map((e) => (e.id === id ? next : e)),
    };
    update({ ...touchContent() });
    pushExerciseUpsert(next);
    return;
  }

  if (state.customExercises.some((e) => e.id === id)) {
    update({
      customExercises: state.customExercises.map((e) => (e.id === id ? next : e)),
      ...touchContent(),
    });
  } else {
    update({
      updatedExercises: { ...state.updatedExercises, [id]: next },
      ...touchContent(),
    });
  }
}

export function deleteExercise(id: string): void {
  if (remoteContent) {
    remoteContent = {
      ...remoteContent,
      exercises: remoteContent.exercises.filter((e) => e.id !== id),
    };
    update({ ...touchContent() });
    pushExerciseDelete(id);
    return;
  }

  if (state.customExercises.some((e) => e.id === id)) {
    update({
      customExercises: state.customExercises.filter((e) => e.id !== id),
      ...touchContent(),
    });
  } else {
    const { [id]: _removed, ...restUpdated } = state.updatedExercises;
    update({
      deletedExerciseIds: [...state.deletedExerciseIds, id],
      updatedExercises: restUpdated,
      ...touchContent(),
    });
  }
}

// ─── Program aksiyonları ─────────────────────────────────────────────────────

export interface ProgramInput {
  title: string;
  description: string;
  category: Program['category'];
  level: Program['level'];
  durationWeeks: number;
  weeklyDays: Program['weeklyDays'];
  isPremium: boolean;
}

/**
 * Haftalık planı mevcut antrenman kataloğundan döngüsel olarak üretir —
 * admin panelden oluşturulan program mobil tarafta hemen oynatılabilir olur.
 */
export function buildProgramWeeks(durationWeeks: number, weeklyDays: number): ProgramWeek[] {
  const dayNumbers = [1, 3, 5, 6, 2].slice(0, weeklyDays).sort((a, b) => a - b);
  let cursor = 0;
  const weeks: ProgramWeek[] = [];
  for (let w = 1; w <= durationWeeks; w++) {
    weeks.push({
      weekNumber: w,
      workouts: dayNumbers.map((day) => {
        const workout = workoutCatalog[cursor % workoutCatalog.length];
        cursor += 1;
        return { day, workoutId: workout.id, name: workout.name };
      }),
    });
  }
  return weeks;
}

export function createProgram(input: ProgramInput): Program {
  const now = new Date().toISOString();
  const program: Program = {
    id: `prog_custom_${Date.now()}`,
    title: input.title,
    description: input.description,
    category: input.category,
    level: input.level,
    durationWeeks: input.durationWeeks,
    weeklyDays: input.weeklyDays,
    equipment: ['mixed'],
    targetMuscles: ['full_body'],
    weeks: buildProgramWeeks(input.durationWeeks, input.weeklyDays),
  };
  const meta: ProgramMeta = {
    status: 'draft',
    isPremium: input.isPremium,
    createdAt: now,
    updatedAt: now,
  };

  if (remoteContent) {
    remoteContent = { ...remoteContent, programs: [...remoteContent.programs, { program, meta }] };
    update({ ...touchContent() });
    pushProgramUpsert(program, meta);
    return program;
  }

  update({
    customPrograms: [...state.customPrograms, program],
    programMeta: { ...state.programMeta, [program.id]: meta },
    ...touchContent(),
  });
  return program;
}

export function updateProgram(id: string, input: ProgramInput): void {
  const managed = state.programs.find((m) => m.program.id === id);
  if (!managed) return;

  const current = managed.program;
  const scheduleChanged =
    current.durationWeeks !== input.durationWeeks || current.weeklyDays !== input.weeklyDays;

  const next: Program = {
    ...current,
    title: input.title,
    description: input.description,
    category: input.category,
    level: input.level,
    durationWeeks: input.durationWeeks,
    weeklyDays: input.weeklyDays,
    weeks: scheduleChanged
      ? buildProgramWeeks(input.durationWeeks, input.weeklyDays)
      : current.weeks,
  };

  const meta: ProgramMeta = {
    ...managed.meta,
    isPremium: input.isPremium,
    updatedAt: new Date().toISOString(),
  };

  if (remoteContent) {
    remoteContent = {
      ...remoteContent,
      programs: remoteContent.programs.map((m) =>
        m.program.id === id ? { program: next, meta } : m,
      ),
    };
    update({ ...touchContent() });
    pushProgramUpsert(next, meta);
    return;
  }

  const patch: Partial<PersistedState> = {
    programMeta: { ...state.programMeta, [id]: meta },
    ...touchContent(),
  };
  if (state.customPrograms.some((p) => p.id === id)) {
    patch.customPrograms = state.customPrograms.map((p) => (p.id === id ? next : p));
  } else {
    patch.updatedPrograms = { ...state.updatedPrograms, [id]: next };
  }
  update(patch);
}

export function deleteProgram(id: string): void {
  if (remoteContent) {
    remoteContent = {
      ...remoteContent,
      programs: remoteContent.programs.filter((m) => m.program.id !== id),
    };
    update({
      users: state.users.map((u) =>
        u.assignedProgramIds.includes(id)
          ? { ...u, assignedProgramIds: u.assignedProgramIds.filter((p) => p !== id) }
          : u,
      ),
      ...touchContent(),
    });
    pushProgramDelete(id);
    return;
  }

  const { [id]: _removedProgram, ...restUpdated } = state.updatedPrograms;
  const { [id]: _removedMeta, ...restMeta } = state.programMeta;
  update({
    customPrograms: state.customPrograms.filter((p) => p.id !== id),
    updatedPrograms: restUpdated,
    programMeta: restMeta,
    deletedProgramIds: state.customPrograms.some((p) => p.id === id)
      ? state.deletedProgramIds
      : [...state.deletedProgramIds, id],
    // Atanmış programı kullanıcılardan da kaldır
    users: state.users.map((u) =>
      u.assignedProgramIds.includes(id)
        ? { ...u, assignedProgramIds: u.assignedProgramIds.filter((p) => p !== id) }
        : u,
    ),
    ...touchContent(),
  });
}

function patchProgramMeta(id: string, metaPatch: Partial<ProgramMeta>): void {
  const managed = state.programs.find((m) => m.program.id === id);
  if (!managed) return;
  const meta: ProgramMeta = { ...managed.meta, ...metaPatch, updatedAt: new Date().toISOString() };

  if (remoteContent) {
    remoteContent = {
      ...remoteContent,
      programs: remoteContent.programs.map((m) =>
        m.program.id === id ? { program: m.program, meta } : m,
      ),
    };
    update({ ...touchContent() });
    pushProgramUpsert(managed.program, meta);
    return;
  }

  update({
    programMeta: { ...state.programMeta, [id]: meta },
    ...touchContent(),
  });
}

export function setProgramStatus(id: string, status: ContentStatus): void {
  patchProgramMeta(id, { status });
}

export function setProgramPremium(id: string, isPremium: boolean): void {
  patchProgramMeta(id, { isPremium });
}

// ─── Kullanıcı / üyelik aksiyonları ─────────────────────────────────────────

function patchUser(userId: string, patch: Partial<UserAccount>): UserAccount[] {
  return state.users.map((u) => (u.id === userId ? { ...u, ...patch } : u));
}

/** Manuel premium tanımlama — plan süresine göre başlangıç/bitiş tarihi yazar */
export function grantPremium(userId: string, planId: SubscriptionPlanId): Subscription | undefined {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  const user = state.users.find((u) => u.id === userId);
  if (!plan || !user) return undefined;

  const start = new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + plan.periodMonths);

  const subscription: Subscription = {
    id: `sub_${Date.now()}`,
    userId,
    planId,
    status: 'active',
    startedAt: start.toISOString(),
    expiresAt: end.toISOString(),
    autoRenew: false,
  };

  update({
    subscriptions: [
      ...state.subscriptions.map((s) =>
        s.userId === userId && s.status === 'active'
          ? { ...s, status: 'cancelled' as const }
          : s,
      ),
      subscription,
    ],
    users: patchUser(userId, { membership: 'premium' }),
  });
  if (isRemote()) pushGrantPremium(userId, planId, plan.periodMonths, 'admin');
  return subscription;
}

export function cancelPremium(userId: string): void {
  update({
    subscriptions: state.subscriptions.map((s) =>
      s.userId === userId && s.status === 'active'
        ? { ...s, status: 'cancelled' as const }
        : s,
    ),
    users: patchUser(userId, { membership: 'free' }),
  });
  if (isRemote()) pushCancelPremium(userId);
}

export function assignProgramToUser(userId: string, programId: string): void {
  const user = state.users.find((u) => u.id === userId);
  if (!user || user.assignedProgramIds.includes(programId)) return;
  update({
    users: patchUser(userId, {
      assignedProgramIds: [...user.assignedProgramIds, programId],
    }),
  });
  if (isRemote()) {
    pushAssignProgram(userId, programId, getAuthState().account?.id ?? null);
  }
}

export function unassignProgramFromUser(userId: string, programId: string): void {
  const user = state.users.find((u) => u.id === userId);
  if (!user) return;
  update({
    users: patchUser(userId, {
      assignedProgramIds: user.assignedProgramIds.filter((id) => id !== programId),
    }),
  });
  if (isRemote()) pushUnassignProgram(userId, programId);
}

// ─── Cihaz kullanıcısı senkronizasyonu ───────────────────────────────────────

export interface DeviceUserSnapshot {
  profile: UserProfile;
  membership: MembershipTier;
  stats: UserActivityStats;
}

/**
 * Mobil taraf (UserContext) her değişiklikte çağırır: profil, üyelik ve
 * antrenman istatistikleri admin paneline yansır. Değişiklik yoksa emit edilmez.
 */
export function syncDeviceUser(snapshot: DeviceUserSnapshot): void {
  if (!state.ready) return;
  // Canlı modda gerçek hesaplar vardır; cihaz-yerel sanal kullanıcı yazılmaz
  if (isRemote()) return;

  const existing = state.users.find((u) => u.id === DEVICE_USER_ID);
  const unchanged =
    existing &&
    existing.membership === snapshot.membership &&
    JSON.stringify(existing.profile) === JSON.stringify(snapshot.profile) &&
    JSON.stringify(existing.stats) === JSON.stringify(snapshot.stats);
  if (unchanged) return;

  const now = new Date().toISOString();
  let subscriptions = state.subscriptions;

  // Üyelik uygulama içinden değiştiyse abonelik kaydını da tutarlı tut
  if (snapshot.membership === 'premium') {
    const hasActive = subscriptions.some(
      (s) => s.userId === DEVICE_USER_ID && s.status === 'active',
    );
    if (!hasActive) {
      const plan = SUBSCRIPTION_PLANS[0];
      const end = new Date();
      end.setMonth(end.getMonth() + plan.periodMonths);
      subscriptions = [
        ...subscriptions,
        {
          id: `sub_${Date.now()}`,
          userId: DEVICE_USER_ID,
          planId: plan.id,
          status: 'active',
          startedAt: now,
          expiresAt: end.toISOString(),
          autoRenew: false,
        },
      ];
    }
  } else if (existing?.membership === 'premium') {
    subscriptions = subscriptions.map((s) =>
      s.userId === DEVICE_USER_ID && s.status === 'active'
        ? { ...s, status: 'cancelled' as const }
        : s,
    );
  }

  const account: UserAccount = {
    id: DEVICE_USER_ID,
    email: existing?.email,
    profile: snapshot.profile,
    membership: snapshot.membership,
    status: 'active',
    createdAt: existing?.createdAt ?? snapshot.profile.createdAt ?? now,
    lastActiveAt: now,
    assignedProgramIds: existing?.assignedProgramIds ?? [],
    stats: snapshot.stats,
    isDevice: true,
  };

  update({
    users: existing
      ? state.users.map((u) => (u.id === DEVICE_USER_ID ? account : u))
      : [account, ...state.users],
    subscriptions,
  });
}

// ─── Bildirim & ayar aksiyonları ─────────────────────────────────────────────

export function addCampaign(campaign: NotificationCampaign): void {
  update({ campaigns: [campaign, ...state.campaigns] });
  if (isRemote()) pushCampaign(campaign, getAuthState().account?.id ?? null);
}

export function updateAppSettings(patch: Partial<AppSettings>): void {
  update({ settings: { ...state.settings, ...patch } });
}

/** Yerel yönetim verisini sıfırlar: kullanıcı/üyelik/kampanya kayıtları ve
 *  içerik değişiklikleri silinir, katalog varsayılana döner. */
export async function resetLocalData(): Promise<void> {
  if (isRemote()) {
    // Canlı modda veri Supabase'tedir; yerel sıfırlama yalnızca yeniden çeker
    await refreshRemote();
    return;
  }
  await AsyncStorage.removeItem(STORE_KEY);
  const empty = emptyPersisted();
  state = {
    ...empty,
    ready: true,
    exercises: mergeExercises(empty),
    programs: mergePrograms(empty),
  };
  emit();
  void persist();
}
