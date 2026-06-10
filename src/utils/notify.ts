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

/**
 * Onay diyaloğu — silme gibi geri alınamaz işlemler için.
 * Web'de window.confirm, native'de Alert butonları kullanılır.
 */
export function confirmAction(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    const g = globalThis as { confirm?: (msg: string) => boolean };
    return Promise.resolve(g.confirm?.(`${title}\n\n${message}`) ?? false);
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Vazgeç', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Onayla', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
