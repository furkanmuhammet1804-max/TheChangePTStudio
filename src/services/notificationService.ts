/**
 * Bildirim gönderim servisi.
 *
 * Şu an gönderim mock'tur (push altyapısı bağlı değil) ama servis sözleşmesi
 * gerçektir: kampanya kaydı oluşturur, hedef kitleyi gerçek kullanıcı
 * listesinden hesaplar ve geçmişe yazar. Expo Push / FCM bağlandığında sadece
 * `deliver()` içi değişir.
 */
import { addCampaign, getAppState } from '@/src/services/appStore';
import { NotificationAudience, NotificationCampaign, UserAccount } from '@/src/types/admin';

export interface CampaignInput {
  title: string;
  body: string;
  audience: NotificationAudience;
}

/** Hedef kitledeki kullanıcılar — free seçimi premium olmayan herkesi kapsar */
export function audienceUsers(users: UserAccount[], audience: NotificationAudience): UserAccount[] {
  if (audience === 'all') return users;
  if (audience === 'premium') return users.filter((u) => u.membership === 'premium');
  return users.filter((u) => u.membership !== 'premium');
}

export function audienceReach(audience: NotificationAudience): number {
  return audienceUsers(getAppState().users, audience).length;
}

/** Gerçek push entegrasyonunun bağlanacağı tek nokta */
async function deliver(_campaign: NotificationCampaign, _recipients: UserAccount[]): Promise<void> {
  // Mock gönderim: ağ gecikmesini taklit eder.
  await new Promise((resolve) => setTimeout(resolve, 400));
}

export async function sendCampaign(input: CampaignInput): Promise<NotificationCampaign> {
  const recipients = audienceUsers(getAppState().users, input.audience);
  const now = new Date().toISOString();
  const campaign: NotificationCampaign = {
    id: `camp_${Date.now()}`,
    title: input.title,
    body: input.body,
    audience: input.audience,
    status: 'sent',
    createdAt: now,
    sentAt: now,
    reach: recipients.length,
  };
  await deliver(campaign, recipients);
  addCampaign(campaign);
  return campaign;
}
