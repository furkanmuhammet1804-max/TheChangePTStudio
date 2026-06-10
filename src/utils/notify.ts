import { Alert, Platform } from 'react-native';

/**
 * Platformlar arası basit bildirim. RN'in Alert.alert'i web'de çalışmadığı
 * için web'de tarayıcı alert'ine düşer. Admin paneldeki placeholder
 * aksiyonlar için yeterli — ileride toast bileşeniyle değiştirilebilir.
 */
export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    const g = globalThis as { alert?: (msg: string) => void };
    g.alert?.(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}
