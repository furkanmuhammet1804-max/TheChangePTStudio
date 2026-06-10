/**
 * Sağlık platformu entegrasyon servisi (Apple Health / Google Fit).
 *
 * GERÇEK ENTEGRASYON GEREKSİNİMLERİ (Expo Go'da ÇALIŞMAZ, native build ister):
 *  - iOS  : `react-native-health` (HealthKit) + app.json'da HealthKit
 *           entitlement + NSHealthShareUsageDescription → EAS dev/prod build
 *  - Android: `react-native-health-connect` (Health Connect API, Android 14+)
 *           veya Google Fit REST — yine EAS native build gerektirir
 *
 * Bu yüzden UI sahte "bağlandı" göstermez; durum dürüstçe bildirilir.
 * Paketler eklendiğinde yalnızca bu modülün gövdesi değişir; UI aynı kalır.
 */
import { Platform } from 'react-native';

export type HealthProvider = 'apple_health' | 'google_fit';
export type HealthConnectionStatus = 'unavailable' | 'not_connected' | 'connected' | 'coming_soon';

export interface HealthProviderInfo {
  provider: HealthProvider;
  label: string;
  status: HealthConnectionStatus;
}

/** Platforma göre gösterilecek sağlayıcılar ve durumları */
export function getHealthProviders(): HealthProviderInfo[] {
  return [
    {
      provider: 'apple_health',
      label: 'Apple Health',
      status: Platform.OS === 'ios' ? 'coming_soon' : 'unavailable',
    },
    {
      provider: 'google_fit',
      label: 'Google Fit',
      status: Platform.OS === 'android' ? 'coming_soon' : 'unavailable',
    },
  ];
}

/** Gerçek entegrasyon bağlanana kadar her zaman 'coming_soon' döner */
export async function connectHealthProvider(
  _provider: HealthProvider,
): Promise<HealthConnectionStatus> {
  return 'coming_soon';
}

export async function disconnectHealthProvider(_provider: HealthProvider): Promise<void> {
  // Entegrasyon bağlandığında izinler burada bırakılacak
}
