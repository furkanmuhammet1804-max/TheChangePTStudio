/**
 * Supabase veri köprüsü — appStore'un canlı moddaki okuma/yazma yolu.
 *
 * Bu modül SADECE saf fetch/push fonksiyonları içerir (appStore'a bağımlı
 * değildir; döngüsel import yoktur). appStore canlı modda:
 *   - açılışta fetchRemoteContent / fetchAdminData ile beslenir,
 *   - aksiyonlarda push* fonksiyonlarıyla Supabase'e yazar,
 *   - subscribeRealtime ile diğer cihazlardaki değişiklikleri anında alır.
 *
 * RLS notu: SELECT sorguları oturumdaki kullanıcının görebildiği satırları
 * döndürür (müşteri kendi kayıtlarını, admin tümünü) — kod her iki rolde de
 * aynı kalır, yetki veritabanında uygulanır.
 */
import { getSupabase } from '@/src/lib/supabase';
import {
  ManagedProgram,
  NotificationCampaign,
  ProgramMeta,
  Subscription,
  SubscriptionPlanId,
  UserAccount,
  UserActivityStats,
} from '@/src/types/admin';
import {
  Exercise,
  Program,
  ProgramWeek,
  UserProfile,
} from '@/src/types';

// ─── Satır → uygulama tipi eşleyicileri ─────────────────────────────────────

interface ExerciseRow {
  id: string;
  name: string;
  description_tr: string;
  muscle_group: string;
  environments: string[];
  equipment: string;
  difficulty: string;
  instructions_tr: string[];
  tips_tr: string[];
  mistakes_tr: string[];
  alternatives: string[];
  sets: number | null;
  reps: string | null;
  rest_seconds: number | null;
  image_url: string | null;
  gif_url: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  media_status: string | null;
  is_active: boolean;
}

function exerciseFromRow(r: ExerciseRow): Exercise {
  return {
    id: r.id,
    name: r.name,
    muscleGroup: r.muscle_group as Exercise['muscleGroup'],
    difficulty: r.difficulty as Exercise['difficulty'],
    equipment: r.equipment as Exercise['equipment'],
    environments: (r.environments ?? []) as Exercise['environments'],
    description: r.description_tr ?? '',
    howTo: r.instructions_tr ?? [],
    tips: r.tips_tr ?? [],
    commonMistakes: r.mistakes_tr ?? [],
    alternatives: r.alternatives ?? [],
    sets: r.sets ?? undefined,
    reps: r.reps ?? undefined,
    rest: r.rest_seconds ?? undefined,
    imageUrl: r.image_url ?? undefined,
    gifUrl: r.gif_url ?? undefined,
    videoUrl: r.video_url ?? undefined,
    thumbnailUrl: r.thumbnail_url ?? undefined,
    mediaStatus: (r.media_status ?? undefined) as Exercise['mediaStatus'],
  };
}

function exerciseToRow(e: Exercise): Record<string, unknown> {
  return {
    id: e.id,
    name: e.name,
    description_tr: e.description ?? '',
    muscle_group: e.muscleGroup,
    environments: e.environments ?? [],
    equipment: e.equipment,
    difficulty: e.difficulty,
    instructions_tr: e.howTo ?? [],
    tips_tr: e.tips ?? [],
    mistakes_tr: e.commonMistakes ?? [],
    alternatives: e.alternatives ?? [],
    sets: e.sets ?? null,
    reps: e.reps ?? null,
    rest_seconds: e.rest ?? null,
    image_url: e.imageUrl ?? null,
    gif_url: e.gifUrl ?? null,
    video_url: e.videoUrl ?? null,
    thumbnail_url: e.thumbnailUrl ?? null,
    media_status: e.mediaStatus ?? null,
    is_active: true,
    updated_at: new Date().toISOString(),
  };
}

interface ProgramRow {
  id: string;
  title: string;
  description_tr: string;
  goal: string;
  level: string;
  duration_weeks: number;
  weekly_days: number;
  is_premium: boolean;
  is_published: boolean;
  equipment: string[];
  target_muscles: string[];
  badge: string | null;
  created_at: string;
  updated_at: string;
}

interface ProgramWorkoutRow {
  program_id: string;
  week_number: number;
  day_index: number;
  workout_id: string;
  workout_title: string;
}

function programFromRows(p: ProgramRow, workouts: ProgramWorkoutRow[]): ManagedProgram {
  const byWeek = new Map<number, ProgramWeek>();
  for (const w of workouts) {
    if (w.program_id !== p.id) continue;
    let week = byWeek.get(w.week_number);
    if (!week) {
      week = { weekNumber: w.week_number, workouts: [] };
      byWeek.set(w.week_number, week);
    }
    week.workouts.push({ day: w.day_index, workoutId: w.workout_id, name: w.workout_title });
  }
  const weeks = [...byWeek.values()].sort((a, b) => a.weekNumber - b.weekNumber);
  weeks.forEach((w) => w.workouts.sort((a, b) => a.day - b.day));

  const program: Program = {
    id: p.id,
    title: p.title,
    description: p.description_tr ?? '',
    category: p.goal as Program['category'],
    level: p.level as Program['level'],
    durationWeeks: p.duration_weeks,
    weeklyDays: p.weekly_days as Program['weeklyDays'],
    equipment: (p.equipment ?? ['mixed']) as Program['equipment'],
    targetMuscles: (p.target_muscles ?? ['full_body']) as Program['targetMuscles'],
    badge: p.badge ?? undefined,
    weeks,
  };
  const meta: ProgramMeta = {
    status: p.is_published ? 'published' : 'draft',
    isPremium: p.is_premium,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
  return { program, meta };
}

function programToRow(program: Program, meta: ProgramMeta): Record<string, unknown> {
  return {
    id: program.id,
    title: program.title,
    description_tr: program.description ?? '',
    goal: program.category,
    level: program.level,
    duration_weeks: program.durationWeeks,
    weekly_days: program.weeklyDays,
    is_premium: meta.isPremium,
    is_published: meta.status === 'published',
    equipment: program.equipment ?? ['mixed'],
    target_muscles: program.targetMuscles ?? ['full_body'],
    badge: program.badge ?? null,
    updated_at: new Date().toISOString(),
  };
}

interface MembershipRow {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  starts_at: string;
  ends_at: string;
}

function subscriptionFromRow(r: MembershipRow): Subscription {
  return {
    id: r.id,
    userId: r.user_id,
    planId: r.plan as SubscriptionPlanId,
    status: r.status === 'premium' ? 'active' : (r.status as Subscription['status']),
    startedAt: r.starts_at,
    expiresAt: r.ends_at,
    autoRenew: false,
  };
}

// ─── İçerik (egzersiz + program) ─────────────────────────────────────────────

export interface RemoteContent {
  exercises: Exercise[];
  programs: ManagedProgram[];
}

export async function fetchRemoteContent(): Promise<RemoteContent> {
  const supabase = getSupabase();
  const [exRes, progRes, pwRes] = await Promise.all([
    supabase.from('exercises').select('*').order('created_at'),
    supabase.from('programs').select('*').order('created_at'),
    supabase.from('program_workouts').select('program_id, week_number, day_index, workout_id, workout_title'),
  ]);
  if (exRes.error) throw exRes.error;
  if (progRes.error) throw progRes.error;
  if (pwRes.error) throw pwRes.error;

  const workouts = (pwRes.data ?? []) as ProgramWorkoutRow[];
  return {
    exercises: ((exRes.data ?? []) as ExerciseRow[]).map(exerciseFromRow),
    programs: ((progRes.data ?? []) as ProgramRow[]).map((p) => programFromRows(p, workouts)),
  };
}

// ─── Yönetim verisi (kullanıcılar + üyelikler + kampanyalar) ─────────────────

export interface RemoteAdminData {
  users: UserAccount[];
  subscriptions: Subscription[];
  campaigns: NotificationCampaign[];
}

interface UserRow {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  status: string;
  created_at: string;
  last_login_at: string | null;
}

interface ProfileRow {
  user_id: string;
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  goal: string | null;
  level: string | null;
  weekly_days: number | null;
  training_location: string | null;
  starting_weight: number | null;
  target_weight: number | null;
}

interface WorkoutLogRow {
  user_id: string;
  workout_id: string;
  date: string;
  duration_seconds: number;
  total_volume: number;
  completed_at: string;
}

function buildStats(logs: WorkoutLogRow[]): UserActivityStats | undefined {
  if (logs.length === 0) return undefined;
  const sorted = [...logs].sort((a, b) => b.completed_at.localeCompare(a.completed_at));
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
  return {
    totalWorkouts: logs.length,
    currentStreak: 0, // detaylı seri hesabı mobil tarafta yapılır
    weeklyWorkouts: logs.filter((l) => l.date >= weekAgo).length,
    favoriteCount: 0,
    lastWorkoutAt: sorted[0]?.completed_at,
    recentWorkouts: sorted.slice(0, 5).map((l) => ({
      date: l.date,
      workoutId: l.workout_id,
      durationSeconds: l.duration_seconds,
      totalVolume: Number(l.total_volume),
    })),
  };
}

export async function fetchAdminData(): Promise<RemoteAdminData> {
  const supabase = getSupabase();
  const [usersRes, profilesRes, memRes, campRes, logsRes, upRes] = await Promise.all([
    supabase.from('users').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*'),
    supabase.from('memberships').select('*').order('created_at', { ascending: false }),
    supabase.from('notification_campaigns').select('*').order('created_at', { ascending: false }),
    supabase.from('workout_logs')
      .select('user_id, workout_id, date, duration_seconds, total_volume, completed_at')
      .order('completed_at', { ascending: false })
      .limit(1000),
    supabase.from('user_programs').select('user_id, program_id, assigned_by'),
  ]);
  // RLS: müşteri oturumunda bu sorgular yalnızca kendi satırlarını döndürür.
  if (usersRes.error) throw usersRes.error;

  const profiles = new Map(
    ((profilesRes.data ?? []) as ProfileRow[]).map((p) => [p.user_id, p]),
  );
  const memberships = ((memRes.data ?? []) as MembershipRow[]);
  const logsByUser = new Map<string, WorkoutLogRow[]>();
  for (const log of (logsRes.data ?? []) as WorkoutLogRow[]) {
    const list = logsByUser.get(log.user_id) ?? [];
    list.push(log);
    logsByUser.set(log.user_id, list);
  }
  const assignedByUser = new Map<string, string[]>();
  for (const up of (upRes.data ?? []) as { user_id: string; program_id: string; assigned_by: string | null }[]) {
    if (!up.assigned_by) continue;
    const list = assignedByUser.get(up.user_id) ?? [];
    list.push(up.program_id);
    assignedByUser.set(up.user_id, list);
  }

  const now = Date.now();
  const hasActivePremium = (userId: string) =>
    memberships.some(
      (m) =>
        m.user_id === userId &&
        m.status === 'premium' &&
        new Date(m.ends_at).getTime() > now,
    );

  const users: UserAccount[] = ((usersRes.data ?? []) as UserRow[]).map((u) => {
    const p = profiles.get(u.id);
    const profile: UserProfile = {
      name: u.full_name ?? u.email ?? 'Üye',
      age: p?.age ?? 0,
      height: Number(p?.height ?? 0),
      weight: Number(p?.weight ?? 0),
      gender: (p?.gender ?? 'other') as UserProfile['gender'],
      goal: (p?.goal ?? 'beginner') as UserProfile['goal'],
      weeklyDays: (p?.weekly_days ?? 3) as UserProfile['weeklyDays'],
      trainingLocation: (p?.training_location ?? 'mixed') as UserProfile['trainingLocation'],
      level: (p?.level ?? 'beginner') as UserProfile['level'],
      startingWeight: Number(p?.starting_weight ?? p?.weight ?? 0),
      targetWeight: Number(p?.target_weight ?? 0),
      createdAt: u.created_at,
    };
    return {
      id: u.id,
      email: u.email ?? undefined,
      profile,
      membership: hasActivePremium(u.id) ? 'premium' : 'free',
      status: u.status === 'passive' ? 'suspended' : 'active',
      createdAt: u.created_at,
      lastActiveAt: u.last_login_at ?? undefined,
      assignedProgramIds: assignedByUser.get(u.id) ?? [],
      stats: buildStats(logsByUser.get(u.id) ?? []),
    };
  });

  const campaigns: NotificationCampaign[] = (
    (campRes.data ?? []) as {
      id: string; title: string; body: string; audience: string; status: string;
      created_at: string; sent_at: string | null; reach: number;
    }[]
  ).map((c) => ({
    id: c.id,
    title: c.title,
    body: c.body,
    audience: c.audience as NotificationCampaign['audience'],
    status: c.status as NotificationCampaign['status'],
    createdAt: c.created_at,
    sentAt: c.sent_at ?? undefined,
    reach: c.reach,
  }));

  return { users, subscriptions: memberships.map(subscriptionFromRow), campaigns };
}

// ─── Yazma (write-through) ───────────────────────────────────────────────────

function logPushError(op: string) {
  return (err: unknown) => {
    console.warn(`[remoteData] ${op} Supabase'e yazılamadı:`, err);
  };
}

export function pushExerciseUpsert(exercise: Exercise): void {
  void getSupabase().from('exercises').upsert(exerciseToRow(exercise))
    .then(({ error }) => { if (error) logPushError('exercise upsert')(error); });
}

export function pushExerciseDelete(id: string): void {
  // Katalogdan gelen kayıtlar fiziksel silinmek yerine pasife çekilir
  void getSupabase().from('exercises').update({ is_active: false }).eq('id', id)
    .then(({ error }) => { if (error) logPushError('exercise delete')(error); });
}

export function pushProgramUpsert(program: Program, meta: ProgramMeta): void {
  const supabase = getSupabase();
  void (async () => {
    const { error } = await supabase.from('programs').upsert(programToRow(program, meta));
    if (error) throw error;
    // Haftalık planı yeniden yaz (basit ve güvenli: sil + ekle)
    await supabase.from('program_workouts').delete().eq('program_id', program.id);
    const rows = program.weeks.flatMap((week) =>
      week.workouts.map((w) => ({
        program_id: program.id,
        week_number: week.weekNumber,
        day_index: w.day,
        workout_id: w.workoutId,
        workout_title: w.name,
      })),
    );
    if (rows.length > 0) {
      const { error: pwError } = await supabase.from('program_workouts').insert(rows);
      if (pwError) throw pwError;
    }
  })().catch(logPushError('program upsert'));
}

export function pushProgramDelete(id: string): void {
  void getSupabase().from('programs').delete().eq('id', id)
    .then(({ error }) => { if (error) logPushError('program delete')(error); });
}

export function pushGrantPremium(
  userId: string,
  planId: SubscriptionPlanId,
  periodMonths: number,
  source: 'admin' | 'app_store' | 'google_play' = 'admin',
): void {
  const supabase = getSupabase();
  const start = new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + periodMonths);
  void (async () => {
    // Aktif üyelikleri kapat, yenisini aç
    await supabase
      .from('memberships')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .eq('status', 'premium');
    const { error } = await supabase.from('memberships').insert({
      user_id: userId,
      plan: planId,
      status: 'premium',
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      source,
    });
    if (error) throw error;
  })().catch(logPushError('grant premium'));
}

export function pushCancelPremium(userId: string): void {
  void getSupabase()
    .from('memberships')
    .update({ status: 'cancelled' })
    .eq('user_id', userId)
    .eq('status', 'premium')
    .then(({ error }) => { if (error) logPushError('cancel premium')(error); });
}

export function pushAssignProgram(userId: string, programId: string, adminId: string | null): void {
  void getSupabase().from('user_programs').upsert(
    {
      user_id: userId,
      program_id: programId,
      assigned_by: adminId,
      status: 'assigned',
    },
    { onConflict: 'user_id,program_id' },
  ).then(({ error }) => { if (error) logPushError('assign program')(error); });
}

export function pushUnassignProgram(userId: string, programId: string): void {
  void getSupabase()
    .from('user_programs')
    .delete()
    .eq('user_id', userId)
    .eq('program_id', programId)
    .then(({ error }) => { if (error) logPushError('unassign program')(error); });
}

export function pushCampaign(campaign: NotificationCampaign, createdBy: string | null): void {
  void getSupabase().from('notification_campaigns').insert({
    id: campaign.id,
    title: campaign.title,
    body: campaign.body,
    audience: campaign.audience,
    status: campaign.status,
    reach: campaign.reach,
    created_by: createdBy,
    sent_at: campaign.sentAt ?? null,
  }).then(({ error }) => { if (error) logPushError('campaign insert')(error); });
}

// ─── Realtime ────────────────────────────────────────────────────────────────

const SYNC_TABLES = [
  'exercises',
  'programs',
  'program_workouts',
  'users',
  'memberships',
  'user_programs',
  'notification_campaigns',
] as const;

/**
 * Tablo değişikliklerini dinler; her değişiklikte onChange çağrılır.
 * Çağıran taraf debounce eder. Dönen fonksiyon aboneliği kapatır.
 */
export function subscribeRealtime(onChange: () => void): () => void {
  const supabase = getSupabase();
  let channel = supabase.channel('app-sync');
  for (const table of SYNC_TABLES) {
    channel = channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      () => onChange(),
    );
  }
  channel.subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
