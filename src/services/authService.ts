/**
 * Müşteri kimlik doğrulama servisi (Supabase Auth).
 *
 * Canlı modda (.env dolu): kayıt / giriş / şifre sıfırlama / oturum koruma
 * Supabase üzerinden yürür; başarılı girişte public.users satırı okunur.
 *
 * Yerel modda (.env boş): oturum kavramı yoktur — useAuth() daima
 * { mode: 'local', session: null } döner ve uygulama bugünkü cihaz-yerel
 * davranışıyla çalışır. Ekranlar mode kontrolüyle auth akışını atlar.
 */
import { useSyncExternalStore } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/src/lib/supabase';

export type AuthMode = 'remote' | 'local';

export interface AuthAccount {
  id: string;
  email: string;
  fullName: string;
  role: 'customer' | 'admin';
  status: 'active' | 'passive';
}

export interface AuthState {
  ready: boolean;
  mode: AuthMode;
  /** Canlı modda oturum açık kullanıcı; yerel modda her zaman null */
  account: AuthAccount | null;
}

export interface AuthResult {
  ok: boolean;
  /** Kullanıcıya gösterilebilir Türkçe hata */
  error?: string;
}

let state: AuthState = {
  ready: !isSupabaseConfigured(), // yerel modda beklemeden hazır
  mode: isSupabaseConfigured() ? 'remote' : 'local',
  account: null,
};

const listeners = new Set<() => void>();

function setState(next: AuthState) {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export function getAuthState(): AuthState {
  return state;
}

/** auth değişikliklerini dinlemek isteyen modüller için (UserContext, sync) */
export function subscribeAuth(listener: () => void): () => void {
  return subscribe(listener);
}

// ─── Hata çevirisi ───────────────────────────────────────────────────────────

function trError(message: string | undefined): string {
  const m = (message ?? '').toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-posta veya şifre hatalı.';
  if (m.includes('already registered')) return 'Bu e-posta ile zaten bir hesap var.';
  if (m.includes('password should be at least')) return 'Şifre en az 6 karakter olmalı.';
  if (m.includes('invalid email') || m.includes('valid email')) return 'Geçerli bir e-posta adresi girin.';
  if (m.includes('email not confirmed')) return 'E-posta adresinizi doğrulayın (gelen kutunuzu kontrol edin).';
  if (m.includes('network') || m.includes('fetch')) return 'Bağlantı hatası — internetinizi kontrol edin.';
  return 'İşlem başarısız oldu. Lütfen tekrar deneyin.';
}

// ─── Hesap satırı ────────────────────────────────────────────────────────────

async function fetchAccount(userId: string): Promise<AuthAccount | null> {
  const { data, error } = await getSupabase()
    .from('users')
    .select('id, email, full_name, role, status')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    email: data.email ?? '',
    fullName: data.full_name ?? '',
    role: data.role === 'admin' ? 'admin' : 'customer',
    status: data.status === 'passive' ? 'passive' : 'active',
  };
}

async function applySession(userId: string | null): Promise<void> {
  if (!userId) {
    setState({ ...state, ready: true, account: null });
    return;
  }
  const account = await fetchAccount(userId);
  setState({ ...state, ready: true, account });
  // Son giriş zamanını arka planda işle (hata kritik değil)
  if (account) {
    void getSupabase()
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId)
      .then(() => {});
  }
}

// ─── Başlatma ────────────────────────────────────────────────────────────────

let initPromise: Promise<void> | null = null;

/** Uygulama açılışında bir kez çağrılır — kalıcı oturumu geri yükler */
export function initAuth(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (!isSupabaseConfigured()) return; // yerel mod: zaten ready
    const supabase = getSupabase();
    const { data } = await supabase.auth.getSession();
    await applySession(data.session?.user.id ?? null);
    supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session?.user.id ?? null);
    });
  })();
  return initPromise;
}

// ─── İşlemler ────────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string, fullName: string): Promise<AuthResult> {
  try {
    const { error } = await getSupabase().auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    if (error) return { ok: false, error: trError(error.message) };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Bağlantı hatası — internetinizi kontrol edin.' };
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const { error } = await getSupabase().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { ok: false, error: trError(error.message) };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Bağlantı hatası — internetinizi kontrol edin.' };
  }
}

export async function signOut(): Promise<void> {
  try {
    await getSupabase().auth.signOut();
  } catch {
    // oturum zaten kapalıysa yoksay
  }
}

export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim().toLowerCase());
    if (error) return { ok: false, error: trError(error.message) };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Bağlantı hatası — internetinizi kontrol edin.' };
  }
}
