/**
 * Geçici admin oturum yönetimi.
 *
 * /admin rotası artık herkese açık değil: kullanıcı adı + şifre ile basit bir
 * oturum açılır ve AsyncStorage'da saklanır. Gerçek auth (Supabase/Firebase
 * Auth) bağlandığında sadece bu modül değişir; layout/ekran kodu aynı kalır.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

const SESSION_KEY = '@tcp_admin_session';

// Geçici kimlik bilgileri — gerçek auth sistemiyle değiştirilecek.
const ADMIN_USERNAME = 'thechange';
const ADMIN_PASSWORD = '0000';

export interface AdminAuthState {
  ready: boolean;
  authenticated: boolean;
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

let initPromise: Promise<void> | null = null;

export function initAdminAuth(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      let authenticated = false;
      try {
        authenticated = (await AsyncStorage.getItem(SESSION_KEY)) === 'active';
      } catch {
        authenticated = false;
      }
      setAuthState({ ready: true, authenticated });
    })();
  }
  return initPromise;
}

export async function loginAdmin(username: string, password: string): Promise<boolean> {
  const ok = username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD;
  if (ok) {
    try {
      await AsyncStorage.setItem(SESSION_KEY, 'active');
    } catch { /* oturum kalıcı olmasa da devam et */ }
    setAuthState({ ready: true, authenticated: true });
  }
  return ok;
}

export async function logoutAdmin(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch { /* yoksay */ }
  setAuthState({ ready: true, authenticated: false });
}
