/**
 * Ödeme / abonelik servisi.
 *
 * Mağaza içi abonelik (App Store / Google Play) canlıya alınırken önerilen
 * yol RevenueCat'tir (react-native-purchases): ürün tanımı, makbuz doğrulama
 * ve abonelik durumu RevenueCat üzerinden yönetilir. Mağaza geliştirici
 * hesapları ve ürün ID'leri tanımlanmadan canlı tahsilat YAPILAMAZ.
 *
 * Bu modül o entegrasyonun sözleşmesidir:
 *  - Bugün: `purchasePlan` güvenli yerel onay döner; premium erişim cihazda
 *    gerçekten açılır ve abonelik kaydı (başlangıç/bitiş tarihli) oluşturulur.
 *  - Yarın: gövde RevenueCat satın alma çağrısına dönüşür; ekran kodu değişmez.
 */
import { grantPremium, SUBSCRIPTION_PLANS, DEVICE_USER_ID, getAppState } from '@/src/services/appStore';
import { SubscriptionPlan, SubscriptionPlanId } from '@/src/types/admin';

export type PaymentProvider = 'local' | 'revenuecat';

/** Aktif sağlayıcı — RevenueCat anahtarları tanımlanınca 'revenuecat' olur */
export const ACTIVE_PAYMENT_PROVIDER: PaymentProvider = 'local';

export interface PurchaseResult {
  success: boolean;
  planId: SubscriptionPlanId;
  /** Üyelik bitiş tarihi (ISO) — başarılıysa */
  expiresAt?: string;
  /** Kullanıcıya gösterilebilir hata */
  error?: string;
}

export function listPlans(): SubscriptionPlan[] {
  return SUBSCRIPTION_PLANS;
}

/**
 * Plan satın alma. Yerel modda: cihaz kullanıcısına gerçek bir abonelik
 * kaydı açar (admin paneldeki üyeliklerde tarihleriyle görünür) ve premium
 * erişimi etkinleştirir. Mağaza tahsilatı RevenueCat bağlanınca devreye girer.
 */
export async function purchasePlan(planId: SubscriptionPlanId): Promise<PurchaseResult> {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  if (!plan) {
    return { success: false, planId, error: 'Plan bulunamadı.' };
  }

  // Cihaz kullanıcısı store'a kayıtlıysa abonelik kaydı da oluştur
  const hasDeviceUser = getAppState().users.some((u) => u.id === DEVICE_USER_ID);
  const subscription = hasDeviceUser ? grantPremium(DEVICE_USER_ID, planId) : undefined;

  return {
    success: true,
    planId,
    expiresAt: subscription?.expiresAt,
  };
}

/** Mağaza aboneliklerini geri yükleme — RevenueCat restorePurchases'a bağlanacak */
export async function restorePurchases(): Promise<boolean> {
  return getAppState().users.find((u) => u.id === DEVICE_USER_ID)?.membership === 'premium';
}
