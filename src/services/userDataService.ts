/**
 * Müşteri hesabı veri senkronu (Supabase) — UserContext'in canlı mod köprüsü.
 *
 * Canlı modda oturum açan kullanıcının profili, üyeliği, favorileri,
 * antrenman logları, dönüşüm fotoğrafları ve program durumu Supabase'te
 * saklanır. UserContext yerel state'i yine tutar (anlık UI + offline cache);
 * bu modül yükleme (login sonrası) ve yazma (her değişiklikte) işlerini yapar.
 */
import {
  ActiveProgram,
  MembershipTier,
  TransformationPhoto,
  UserProfile,
  WorkoutLog,
} from '@/src/types';
import { SubscriptionPlanId } from '@/src/types/admin';
import { getSupabase } from '@/src/lib/supabase';
import { Platform } from 'react-native';

function warn(op: string, err: unknown) {
  console.warn(`[userData] ${op} başarısız:`, err);
}

// ─── Yükleme ─────────────────────────────────────────────────────────────────

export interface RemoteUserData {
  profile: UserProfile | null;
  membership: MembershipTier;
  favoriteExerciseIds: string[];
  workoutLogs: WorkoutLog[];
  transformationPhotos: Partial<Record<'before' | 'after', TransformationPhoto>>;
  assignedProgramIds: string[];
  activeProgram: ActiveProgram | null;
}

export async function loadUserData(userId: string): Promise<RemoteUserData> {
  const supabase = getSupabase();
  const [userRes, profRes, memRes, favRes, logRes, photoRes, upRes] = await Promise.all([
    supabase.from('users').select('full_name, created_at').eq('id', userId).maybeSingle(),
    supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase
      .from('memberships')
      .select('status, ends_at')
      .eq('user_id', userId)
      .eq('status', 'premium')
      .gt('ends_at', new Date().toISOString())
      .limit(1),
    supabase.from('favorites').select('exercise_id').eq('user_id', userId),
    supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: true })
      .limit(500),
    supabase.from('transformation_photos').select('*').eq('user_id', userId),
    supabase.from('user_programs').select('*').eq('user_id', userId),
  ]);

  // Profil — boş profil satırı (trigger açar) onboarding tamamlanmadı sayılır
  let profile: UserProfile | null = null;
  const p = profRes.data;
  if (p && p.goal) {
    profile = {
      name: userRes.data?.full_name || 'Üye',
      age: p.age ?? 0,
      height: Number(p.height ?? 0),
      weight: Number(p.weight ?? 0),
      gender: (p.gender ?? 'other') as UserProfile['gender'],
      goal: p.goal as UserProfile['goal'],
      weeklyDays: (p.weekly_days ?? 3) as UserProfile['weeklyDays'],
      trainingLocation: (p.training_location ?? 'mixed') as UserProfile['trainingLocation'],
      level: (p.level ?? 'beginner') as UserProfile['level'],
      startingWeight: Number(p.starting_weight ?? p.weight ?? 0),
      targetWeight: Number(p.target_weight ?? 0),
      createdAt: userRes.data?.created_at ?? new Date().toISOString(),
    };
  }

  const workoutLogs: WorkoutLog[] = (logRes.data ?? []).map((r) => ({
    id: r.id,
    workoutId: r.workout_id,
    programId: r.program_id ?? undefined,
    weekNumber: r.week_number ?? undefined,
    dayIndex: r.day_index ?? undefined,
    date: r.date,
    startedAt: r.started_at ?? r.completed_at,
    completedAt: r.completed_at,
    durationSeconds: r.duration_seconds,
    exercises: Array.isArray(r.sets_json) ? r.sets_json : [],
    totalVolume: Number(r.total_volume),
  }));

  // Fotoğraflar — özel bucket: path saklanır, gösterim için imzalı URL üretilir
  const photos: RemoteUserData['transformationPhotos'] = {};
  for (const row of photoRes.data ?? []) {
    let uri = row.image_url as string;
    if (!uri.startsWith('http')) {
      const { data } = await getSupabase()
        .storage.from('transformation-photos')
        .createSignedUrl(uri, 60 * 60 * 24 * 7);
      uri = data?.signedUrl ?? uri;
    }
    photos[row.type as 'before' | 'after'] = {
      id: row.id,
      type: row.type,
      uri,
      takenAt: row.taken_at,
    };
  }

  // Programlar: admin ataması + aktif program konumu
  const userPrograms = upRes.data ?? [];
  const assignedProgramIds = userPrograms
    .filter((r) => r.assigned_by)
    .map((r) => r.program_id as string);
  const activeRow = userPrograms.find((r) => r.status === 'active');
  const activeProgram: ActiveProgram | null = activeRow
    ? {
        programId: activeRow.program_id,
        weekNumber: activeRow.current_week ?? 1,
        dayIndex: activeRow.current_day ?? 0,
        startedAt: activeRow.started_at ?? new Date().toISOString(),
        completedSessions: [], // oturum anahtarları loglardan türetilebilir
        completedAt: activeRow.completed_at ?? undefined,
      }
    : null;

  return {
    profile,
    membership: (memRes.data?.length ?? 0) > 0 ? 'premium' : 'free',
    favoriteExerciseIds: (favRes.data ?? []).map((f) => f.exercise_id as string),
    workoutLogs,
    transformationPhotos: photos,
    assignedProgramIds,
    activeProgram,
  };
}

// ─── Yazma ───────────────────────────────────────────────────────────────────

export function saveProfileRemote(userId: string, profile: UserProfile): void {
  const supabase = getSupabase();
  void (async () => {
    const { error } = await supabase.from('profiles').upsert({
      user_id: userId,
      age: profile.age,
      gender: profile.gender,
      height: profile.height,
      weight: profile.weight,
      goal: profile.goal,
      level: profile.level,
      weekly_days: profile.weeklyDays,
      training_location: profile.trainingLocation,
      starting_weight: profile.startingWeight,
      target_weight: profile.targetWeight,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    await supabase.from('users').update({ full_name: profile.name }).eq('id', userId);
  })().catch((err) => warn('profil kaydı', err));
}

export function setFavoriteRemote(userId: string, exerciseId: string, favorite: boolean): void {
  const supabase = getSupabase();
  if (favorite) {
    void supabase
      .from('favorites')
      .upsert({ user_id: userId, exercise_id: exerciseId }, { onConflict: 'user_id,exercise_id' })
      .then(({ error }) => { if (error) warn('favori ekleme', error); });
  } else {
    void supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .then(({ error }) => { if (error) warn('favori silme', error); });
  }
}

export function insertWorkoutLogRemote(userId: string, log: WorkoutLog): void {
  void getSupabase().from('workout_logs').insert({
    id: log.id,
    user_id: userId,
    workout_id: log.workoutId,
    program_id: log.programId ?? null,
    week_number: log.weekNumber ?? null,
    day_index: log.dayIndex ?? null,
    date: log.date,
    started_at: log.startedAt,
    completed_at: log.completedAt,
    duration_seconds: log.durationSeconds,
    total_volume: log.totalVolume,
    sets_json: log.exercises,
  }).then(({ error }) => { if (error) warn('antrenman kaydı', error); });
}

/** Fotoğrafı Storage'a yükler, kaydı upsert eder; gösterim için imzalı URL döner */
export async function uploadTransformationPhoto(
  userId: string,
  photo: TransformationPhoto,
): Promise<string> {
  const supabase = getSupabase();
  const response = await fetch(photo.uri);
  const blob = await response.blob();
  const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
  const path = `${userId}/${photo.type}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('transformation-photos')
    .upload(path, blob, { upsert: true, contentType: blob.type || 'image/jpeg' });
  if (uploadError) throw uploadError;

  const { error } = await supabase.from('transformation_photos').upsert(
    {
      id: photo.id,
      user_id: userId,
      type: photo.type,
      image_url: path,
      taken_at: photo.takenAt,
    },
    { onConflict: 'user_id,type' },
  );
  if (error) throw error;

  const { data } = await supabase.storage
    .from('transformation-photos')
    .createSignedUrl(path, 60 * 60 * 24 * 7);
  return data?.signedUrl ?? photo.uri;
}

export function deleteTransformationPhotoRemote(userId: string, type: 'before' | 'after'): void {
  void getSupabase()
    .from('transformation_photos')
    .delete()
    .eq('user_id', userId)
    .eq('type', type)
    .then(({ error }) => { if (error) warn('fotoğraf silme', error); });
}

/** Uygulama içi (test) satın alma — kaynak platforma göre işaretlenir */
export function purchasePremiumRemote(
  userId: string,
  planId: SubscriptionPlanId,
  periodMonths: number,
): void {
  const start = new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + periodMonths);
  void getSupabase().from('memberships').insert({
    user_id: userId,
    plan: planId,
    status: 'premium',
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
    source: Platform.OS === 'ios' ? 'app_store' : 'google_play',
  }).then(({ error }) => { if (error) warn('premium satın alma', error); });
}

export function startProgramRemote(userId: string, programId: string): void {
  void getSupabase().from('user_programs').upsert(
    {
      user_id: userId,
      program_id: programId,
      status: 'active',
      started_at: new Date().toISOString(),
      current_week: 1,
      current_day: 0,
      completed_at: null,
    },
    { onConflict: 'user_id,program_id' },
  ).then(({ error }) => { if (error) warn('program başlatma', error); });
}

export function advanceProgramRemote(userId: string, active: ActiveProgram): void {
  void getSupabase()
    .from('user_programs')
    .update({
      current_week: active.weekNumber,
      current_day: active.dayIndex,
      status: active.completedAt ? 'completed' : 'active',
      completed_at: active.completedAt ?? null,
    })
    .eq('user_id', userId)
    .eq('program_id', active.programId)
    .then(({ error }) => { if (error) warn('program ilerletme', error); });
}

export function abandonProgramRemote(userId: string, programId: string): void {
  void getSupabase()
    .from('user_programs')
    .update({ status: 'abandoned' })
    .eq('user_id', userId)
    .eq('program_id', programId)
    .then(({ error }) => { if (error) warn('program bırakma', error); });
}

// ─── Realtime ────────────────────────────────────────────────────────────────

/**
 * Kullanıcıyı ilgilendiren tablolarda değişiklik olunca onChange çağrılır
 * (admin premium yaptı → anında açılır; program atadı → anında görünür).
 */
export function subscribeUserRealtime(userId: string, onChange: () => void): () => void {
  const supabase = getSupabase();
  const channel = supabase
    .channel(`user-sync-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'memberships', filter: `user_id=eq.${userId}` },
      () => onChange(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'user_programs', filter: `user_id=eq.${userId}` },
      () => onChange(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
      () => onChange(),
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
