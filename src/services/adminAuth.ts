/**
 * Admin oturum yönetimi.
 *
 * CANLI mod (.env'de Supabase tanımlı): e-posta + şifre ile Supabase Auth
 * üzerinden giriş yapılır ve public.users.role = 'admin' şartı aranır.
 * Admin olmayan hesaplar -- doğru şifreyle bile -- panele giremez ve
 * oturumları anında kapatılır; panel bilgisi sızdırılmaz.
 *
 * YEREL mod (.env boş, yalnızca geliştirme): geçici kullanıcı adı/şifre
 * (thechange / 0000) sadece __DEV__ derlemelerinde çalışır. Production
 * derlemesinde yerel modda admin girişi tamamen kapalıdır.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/src/lib/supabase';

const SESSION_KEY = '@tcp_admin_session';

// Geçici kimlik bilgileri — SADECE yerel geliştirme modunda geçerli.
const DEV_ADMIN_USERNAME = 'thechange';
const DEV_ADMIN_PASSWORD = '0000';

export interface AdminAuthState {
  ready: boolean;
  authenticated: boolean;
  /** Canlı modda oturum açan adminin e-postası */
  email?: string;
}

let authState: AdminAuthState = { ready: false, authenticated: false };
const listeners = new Set<() => void>();

function setAuthState(next: AdminAuthState) {
  authState = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useAdminAuth(): AdminAuthState {
  return useSyncExternalStore(subscribe, () => authState, () => authState);
}

/** Giriş ekranının modu — canlıda e-posta, yerelde kullanıcı adı istenir */
export function isRemoteAdminAuth(): boolean {
  return isSupabaseConfigured();
}

// ─── Canlı mod yardımcıları ──────────────────────────────────────────────────

async function fetchIsAdmin(userId: string): Promise<{ isAdmin: boolean; email: string }> {
  const { data } = await getSupabase()
    .from('users')
    .select('role, status, email')
    .eq('id', userId)
    .maybeSingle();
  return {
    isAdmin: data?.role === 'admin' && data?.status === 'active',
    email: data?.email ?? '',
  };
}

// ─── Başlatma ────────────────────────────────────────────────────────────────

let initPromise: Promise<void> | null = null;

export function initAdminAuth(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      if (isSupabaseConfigured()) {
        // Kalıcı Supabase oturumu varsa ve rol admin ise paneli aç
        try {
          const { data } = await getSupabase().auth.getSession();
          const userId = data.session?.user.id;
          if (userId) {
            const { isAdmin, email } = await fetchIsAdmin(userId);
            setAuthState({ ready: true, authenticated: isAdmin, email });
            return;
          }
        } catch {
          // ağ hatası → giriş ekranı göster
        }
        setAuthState({ ready: true, authenticated: false });
        return;
      }

      // Yerel mod: önceki dev oturumunu geri yükle (sadece geliştirmede)
      let authenticated = false;
      if (__DEV__) {
        try {
          authenticated = (await AsyncStorage.getItem(SESSION_KEY)) === 'active';
        } catch {
          authenticated = false;
        }
      }
      setAuthState({ ready: true, authenticated });
    })();
  }
  return initPromise;
}

// ─── Giriş / çıkış ───────────────────────────────────────────────────────────

/**
 * Canlı modda: identifier = e-posta. Yerel dev modunda: kullanıcı adı.
 * Dönüş false ise kimlik hatalı VEYA hesabın admin yetkisi yok — ayrım
 * yapılmaz (panel varlığı hakkında bilgi sızdırmamak için).
 */
export async function loginAdmin(identifier: string, password: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier.trim().toLowerCase(),
        password,
      });
      if (error || !data.user) return false;

      const { isAdmin, email } = await fetchIsAdmin(data.user.id);
      if (!isAdmin) {
        // Yetkisiz hesap: oturumu hemen kapat, panele dair hiçbir şey gösterme
        await supabase.auth.signOut();
        return false;
      }
      setAuthState({ ready: true, authenticated: true, email });
      return true;
    } catch {
      return false;
    }
  }

  // Yerel mod — geçici kimlik sadece geliştirme derlemesinde çalışır
  if (!__DEV__) return false;
  const ok = identifier.trim() === DEV_ADMIN_USERNAME && password === DEV_ADMIN_PASSWORD;
  if (ok) {
    try {
      await AsyncStorage.setItem(SESSION_KEY, 'active');
    } catch { /* oturum kalıcı olmasa da devam et */ }
    setAuthState({ ready: true, authenticated: true });
  }
  return ok;
}

export async function logoutAdmin(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await getSupabase().auth.signOut();
    } catch { /* yoksay */ }
  } else {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
    } catch { /* yoksay */ }
  }
  setAuthState({ ready: true, authenticated: false });
}
