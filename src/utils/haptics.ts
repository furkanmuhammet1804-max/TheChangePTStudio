/**
 * Haptik geri bildirim yardımcıları — premium his için ölçülü kullanılır.
 * Web'de sessizce devre dışı kalır; hata fırlatmaz.
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

/** Buton basışları, chip seçimleri */
export function hapticTap() {
  if (!enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** Set tamamlandı, favoriye ekleme gibi belirgin aksiyonlar */
export function hapticConfirm() {
  if (!enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

/** Antrenman bitti, program başlatıldı — kutlama anları */
export function hapticSuccess() {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/** Premium kilit ekranı, uyarılar */
export function hapticWarning() {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}
