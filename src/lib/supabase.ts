/**
 * Supabase istemcisi — canlı backend bağlantısının TEK noktası.
 *
 * Yapılandırma .env'den okunur (EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY).
 * Değerler boşsa uygulama YEREL modda çalışır: tüm servisler bugünkü
 * AsyncStorage tabanlı davranışlarını sürdürür (test/geliştirme).
 * Değerler doluysa CANLI mod: auth, veri ve medya Supabase üzerinden akar;
 * müşteri uygulaması, admin APK ve web admin panel aynı veritabanını görür.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** Canlı (Supabase) mod aktif mi? — .env dolu ise true */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

let client: SupabaseClient | null = null;

/** Tekil Supabase istemcisi. Yapılandırma yoksa çağırmayın (önce isSupabaseConfigured). */
export function getSupabase(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase yapılandırılmamış: .env içinde EXPO_PUBLIC_SUPABASE_URL ve ' +
        'EXPO_PUBLIC_SUPABASE_ANON_KEY tanımlayın (bkz. SUPABASE_SETUP.md).',
    );
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
