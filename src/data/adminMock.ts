/**
 * Admin panel mock verileri.
 *
 * Backend bağlandığında bu modül silinip yerini src/services/dataSource.ts
 * üzerindeki gerçek repository çağrıları alacak. Ekranlar veriyi prop/import
 * olarak aldığı için geçiş ekran koduna dokunmadan yapılabilir.
 */
import { UserGoal } from '@/src/types';
import { NotificationAudience, SubscriptionPlanId } from '@/src/types/admin';

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const DASHBOARD_STATS = {
  totalUsers: '1.248',
  premiumUsers: '326',
  activePrograms: '18',
  monthlyRevenue: '₺42.850',
  trends: {
    totalUsers: '+%12 bu ay',
    premiumUsers: '+%9 bu ay',
    activePrograms: '3 yeni program',
    monthlyRevenue: '+%14 geçen aya göre',
  },
} as const;

// ─── Kullanıcılar ────────────────────────────────────────────────────────────

export type AdminUserTier = 'free' | 'premium' | 'expired';

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  tier: AdminUserTier;
  goal: UserGoal;
  lastLogin: string;
  active: boolean;
}

export const TIER_LABELS: Record<AdminUserTier, string> = {
  free: 'Ücretsiz',
  premium: 'Premium',
  expired: 'Süresi Dolmuş',
};

export const MOCK_USERS: AdminUserRow[] = [
  { id: 'u_001', name: 'Ahmet Yılmaz',  email: 'ahmet.yilmaz@gmail.com',  tier: 'premium', goal: 'muscle_gain', lastLogin: '2 saat önce',  active: true },
  { id: 'u_002', name: 'Elif Demir',    email: 'elif.demir@hotmail.com',  tier: 'free',    goal: 'fat_burn',    lastLogin: '5 saat önce',  active: true },
  { id: 'u_003', name: 'Mehmet Kaya',   email: 'mehmet.kaya@gmail.com',   tier: 'premium', goal: 'strength',    lastLogin: 'Dün',          active: true },
  { id: 'u_004', name: 'Zeynep Şahin',  email: 'zeynep.sahin@gmail.com',  tier: 'expired', goal: 'fat_burn',    lastLogin: '3 gün önce',   active: true },
  { id: 'u_005', name: 'Burak Çelik',   email: 'burak.celik@outlook.com', tier: 'free',    goal: 'beginner',    lastLogin: '1 hafta önce', active: false },
  { id: 'u_006', name: 'Selin Arslan',  email: 'selin.arslan@gmail.com',  tier: 'premium', goal: 'maintain',    lastLogin: 'Bugün',        active: true },
  { id: 'u_007', name: 'Emre Doğan',    email: 'emre.dogan@gmail.com',    tier: 'free',    goal: 'muscle_gain', lastLogin: '2 gün önce',   active: true },
  { id: 'u_008', name: 'Ayşe Koç',      email: 'ayse.koc@icloud.com',     tier: 'expired', goal: 'beginner',    lastLogin: '2 hafta önce', active: false },
  { id: 'u_009', name: 'Can Öztürk',    email: 'can.ozturk@gmail.com',    tier: 'premium', goal: 'fat_burn',    lastLogin: '4 saat önce',  active: true },
  { id: 'u_010', name: 'Merve Aydın',   email: 'merve.aydin@gmail.com',   tier: 'free',    goal: 'maintain',    lastLogin: 'Dün',          active: true },
];

// ─── Premium üyelikler ───────────────────────────────────────────────────────

export const MEMBERSHIP_STATS = [
  { key: 'active',    label: 'Aktif Premium',    value: '326', trend: '+%9 bu ay',     icon: 'star' as const },
  { key: 'renewed',   label: 'Bu Ay Yenilenen',  value: '84',  trend: '+12 üye',       icon: 'refresh' as const },
  { key: 'expired',   label: 'Süresi Dolan',     value: '23',  trend: 'Son 30 gün',    icon: 'time' as const },
  { key: 'cancelled', label: 'İptal Eden',       value: '11',  trend: '%3,4 churn',    icon: 'close-circle' as const },
];

export interface PlanStats {
  planId: SubscriptionPlanId;
  subscribers: number;
  monthlyRevenue: string;
  popular?: boolean;
}

export const PLAN_STATS: PlanStats[] = [
  { planId: 'monthly',   subscribers: 142, monthlyRevenue: '₺16.450' },
  { planId: 'quarterly', subscribers: 121, monthlyRevenue: '₺19.300', popular: true },
  { planId: 'yearly',    subscribers: 63,  monthlyRevenue: '₺7.100' },
];

// ─── İçerik yönetimi ─────────────────────────────────────────────────────────

/** Yayın durumu — backend'de ManagedProgram.status alanına karşılık gelir */
export const PROGRAM_STATUS: Record<string, 'published' | 'draft'> = {
  prog_beginner_reset: 'published',
  prog_fat_burn: 'published',
  prog_muscle_build: 'published',
  prog_core_control: 'published',
  prog_home_warrior: 'draft',
};

/** Medyası (video/GIF) yüklenmiş egzersizler — backend'de Exercise.videoUrl */
export const EXERCISES_WITH_MEDIA = new Set([
  'ex_pushup',
  'ex_squat',
  'ex_plank',
  'ex_bench_press',
  'ex_burpee',
  'ex_glute_bridge',
]);

// ─── Bildirimler ─────────────────────────────────────────────────────────────

export const AUDIENCE_LABELS: Record<NotificationAudience, string> = {
  all: 'Tüm Kullanıcılar',
  premium: 'Premium Kullanıcılar',
  free: 'Ücretsiz Kullanıcılar',
};

export const AUDIENCE_REACH: Record<NotificationAudience, string> = {
  all: '1.248',
  premium: '326',
  free: '922',
};

export interface SentNotification {
  id: string;
  title: string;
  body: string;
  audience: NotificationAudience;
  sentAt: string;
  reach: string;
}

export const MOCK_SENT_NOTIFICATIONS: SentNotification[] = [
  {
    id: 'n_001',
    title: 'Yeni Kalça Egzersizleri Eklendi',
    body: 'Kütüphaneye Hip Thrust, Kalça Köprüsü ve daha fazlası eklendi. Hemen keşfet!',
    audience: 'all',
    sentAt: '2 gün önce',
    reach: '1.248',
  },
  {
    id: 'n_002',
    title: "Premium'a Özel: Kişisel Program",
    body: 'Hedefine özel programını oluştur, gelişimini adım adım takip et.',
    audience: 'free',
    sentAt: '5 gün önce',
    reach: '922',
  },
  {
    id: 'n_003',
    title: 'Haftalık Motivasyon',
    body: 'Disiplin bugün, sonuç yarın. Bu haftaki antrenmanlarını planladın mı?',
    audience: 'all',
    sentAt: '1 hafta önce',
    reach: '1.241',
  },
];
