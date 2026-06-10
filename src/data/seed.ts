/**
 * Yerel veri kaynağının ilk açılış kayıtları.
 *
 * Admin panel GERÇEK verilerle çalışır: demo/sahte kullanıcı üretilmez.
 * Kullanıcı listesi yalnızca sistemde gerçekten oluşturulan hesaplardan
 * (şimdilik bu cihazdaki kullanıcı; backend sonrası tüm kayıtlı kullanıcılar)
 * beslenir. Boş durumlarda ekranlar "kayıt bulunamadı" gösterir.
 */
import { NotificationCampaign, Subscription, UserAccount } from '@/src/types/admin';

export function buildSeedUsers(): UserAccount[] {
  return [];
}

export function buildSeedSubscriptions(): Subscription[] {
  return [];
}

export function buildSeedCampaigns(): NotificationCampaign[] {
  return [];
}

/**
 * Önceki sürümlerin AsyncStorage'a yazdığı demo kayıtların kimlikleri —
 * açılışta store bunları temizler (gerçek kullanıcı verisine dokunulmaz).
 */
export const LEGACY_DEMO_USER_IDS = new Set([
  'u_001', 'u_002', 'u_003', 'u_004', 'u_005',
  'u_006', 'u_007', 'u_008', 'u_009', 'u_010',
]);

export const LEGACY_DEMO_SUBSCRIPTION_IDS = new Set([
  'sub_001', 'sub_002', 'sub_003', 'sub_004', 'sub_005', 'sub_006',
]);

export const LEGACY_DEMO_CAMPAIGN_IDS = new Set([
  'camp_001', 'camp_002', 'camp_003',
]);
