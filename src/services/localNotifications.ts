/**
 * Yerel bildirim servisi (expo-notifications).
 *
 * Bugün: izin isteme + cihaz üzerinde yerel zamanlama (mock schedule).
 * Yarın: push backend bağlandığında aynı NotificationKind anahtarları
 * sunucudan gelen push'lar için kullanılır; bu modül sadece transport değiştirir.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationKind, NotificationPreferences } from '@/src/types';

const PREFS_KEY = '@tcp_notification_prefs';

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  workoutReminders: true,
  motivation: true,
  productNews: true,
};

/** Bildirim türü → varsayılan Türkçe içerik */
export const NOTIFICATION_TEMPLATES: Record<NotificationKind, { title: string; body: string }> = {
  workout_reminder:   { title: 'Antrenman zamanı', body: 'Bugünkü antrenmanın seni bekliyor. Küçük bir adım, büyük fark.' },
  premium_renewal:    { title: 'Üyeliğin yenileniyor', body: 'Premium üyeliğinin süresi yaklaşıyor. Kaldığın yerden devam et.' },
  new_program:        { title: 'Yeni program yayında', body: 'Koçun yeni bir program yayınladı. Hemen göz at.' },
  motivation:         { title: 'Günün motivasyonu', body: 'Disiplin bugün, sonuç yarın. Hedefine bir adım daha yaklaş.' },
  admin_announcement: { title: 'The Change PT Studio', body: 'Yeni bir duyurun var.' },
};

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

if (isNative) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

// ─── Tercihler ───────────────────────────────────────────────────────────────

export async function loadNotificationPrefs(): Promise<NotificationPreferences> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (raw) return { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(raw) };
  } catch { /* varsayılana dön */ }
  return DEFAULT_NOTIFICATION_PREFS;
}

export async function saveNotificationPrefs(prefs: NotificationPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch { /* yoksay */ }
}

// ─── İzin ────────────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNative) return false; // web'de yerel bildirim desteklenmiyor
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const result = await Notifications.requestPermissionsAsync();
    return result.granted;
  } catch {
    return false;
  }
}

// ─── Zamanlama (mock) ────────────────────────────────────────────────────────

/**
 * Yerel bildirim zamanlar. İzin yoksa veya web'deyse sessizce false döner.
 * Push backend bağlandığında bu fonksiyonun gövdesi sunucu çağrısına dönüşür.
 */
export async function scheduleLocalNotification(
  kind: NotificationKind,
  options?: { title?: string; body?: string; secondsFromNow?: number },
): Promise<boolean> {
  if (!isNative) return false;
  const granted = await requestNotificationPermission();
  if (!granted) return false;

  const template = NOTIFICATION_TEMPLATES[kind];
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: options?.title ?? template.title,
        body: options?.body ?? template.body,
        data: { kind },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(5, options?.secondsFromNow ?? 5),
      },
    });
    return true;
  } catch {
    return false;
  }
}

/** Tüm zamanlanmış yerel bildirimleri iptal eder (tercih kapatıldığında) */
export async function cancelAllScheduled(): Promise<void> {
  if (!isNative) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch { /* yoksay */ }
}
