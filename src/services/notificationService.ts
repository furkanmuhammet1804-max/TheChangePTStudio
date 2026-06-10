/**
 * Bildirim gönderim servisi.
 *
 * Kampanya kaydı oluşturur, hedef kitleyi gerçek kullanıcı listesinden
 * hesaplar ve geçmişe yazar. Gönderim bu cihazda GERÇEK yerel bildirim
 * olarak teslim edilir (test edilebilir); cihazlar arası dağıtım için
 * Expo Push / FCM bağlandığında sadece `deliver()` içi değişir.
 */
import { addCampaign, getAppState } from '@/src/services/appStore';
import { scheduleLocalNotification } from '@/src/services/localNotifications';
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

/** Uzak push entegrasyonunun (Expo Push/FCM) bağlanacağı tek nokta */
async function deliver(campaign: NotificationCampaign, _recipients: UserAccount[]): Promise<void> {
  // Bu cihazda gerçek yerel bildirim olarak teslim edilir (admin APK'da
  // gönderimi anında test etmeyi sağlar). Web'de sessizce atlanır.
  await scheduleLocalNotification('admin_announcement', {
    title: campaign.title,
    body: campaign.body,
    secondsFromNow: 3,
  });
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
