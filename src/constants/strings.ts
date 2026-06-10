export const APP_NAME = 'The Change PT Studio';
export const APP_TAGLINE = 'Değişim bugün başlar.';

export const GOAL_LABELS: Record<string, string> = {
  fat_burn: 'Yağ Yakmak',
  muscle_gain: 'Kas Kazanmak',
  maintain: 'Form Korumak',
  strength: 'Güçlenmek',
  beginner: 'Yeni Başlamak',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Başlangıç',
  intermediate: 'Orta',
  advanced: 'İleri',
  all: 'Her Seviye',
};

export const MUSCLE_LABELS: Record<string, string> = {
  chest: 'Göğüs',
  back: 'Sırt',
  shoulders: 'Omuz',
  biceps: 'Biceps',
  triceps: 'Triceps',
  legs: 'Bacak',
  glutes: 'Kalça',
  core: 'Karın',
  cardio: 'Kardiyo',
  mobility: 'Mobilite',
  full_body: 'Tüm Vücut',
};

// Kas grubu kartlarında gösterilen kısa, güçlü açıklamalar
export const MUSCLE_TAGLINES: Record<string, string> = {
  chest: 'İtme gücünü geliştir.',
  back: 'Duruşunu ve kuvvetini artır.',
  shoulders: 'Daha güçlü ve dengeli dur.',
  biceps: 'Ön kolunu şekillendir, güçlendir.',
  triceps: 'Arka kolunu sıkılaştır.',
  legs: 'Temel gücün burada başlar.',
  glutes: 'Kalça gücünü ve formunu geliştir.',
  core: 'Merkez bölgeni güçlendir.',
  cardio: 'Dayanıklılığını ve enerjini yükselt.',
  mobility: 'Esne, aç ve sağlam kal.',
  full_body: 'Tüm vücudunu dengeli çalıştır.',
};

export const EQUIPMENT_LABELS: Record<string, string> = {
  none: 'Ekipmansız',
  dumbbells: 'Dambıl',
  barbell: 'Halter',
  kettlebell: 'Kettlebell',
  machine: 'Makine',
  cables: 'Kablo',
  resistance_bands: 'Direnç Bandı',
  trx: 'TRX',
  pull_up_bar: 'Barfiks',
  mixed: 'Karma',
};

export const ENVIRONMENT_LABELS: Record<string, string> = {
  home: 'Evde',
  gym: 'Salonda',
  outdoor: 'Dış Mekanda',
  travel: 'Seyahatte',
};

export const MEDIA_STATUS_LABELS: Record<string, string> = {
  missing: 'Medya Eksik',
  image_ready: 'Görsel Hazır',
  gif_ready: 'GIF Hazır',
  video_ready: 'Video Hazır',
};

export const LOCATION_LABELS: Record<string, string> = {
  home: 'Ev',
  gym: 'Spor Salonu',
  mixed: 'Karışık',
};

export const CATEGORY_LABELS: Record<string, string> = {
  all: 'Tümü',
  fat_burn: 'Yağ Yakım',
  muscle_gain: 'Kas Kazanım',
  full_body: 'Tüm Vücut',
  core: 'Merkez',
  home: 'Evde',
  gym: 'Salon',
  beginner: 'Başlangıç',
};

// Koç notları — kısa, güçlü, motive edici (emojisiz)
export const COACH_NOTES = [
  'Bugün mükemmel olmak zorunda değilsin. Sadece başla.',
  'Her tekrar seni hedefine bir adım yaklaştırır.',
  'Önce zihnin değişir, sonra bedenin.',
  'Disiplin, motivasyon bittiğinde devreye girer.',
  'Küçük adımlar büyük dönüşümler yaratır.',
  'Bugünkü çaban, yarınki gücün.',
  'Vazgeçmek yok. Sadece bir sonraki tekrar.',
  'Güçlü olmak bir seçimdir. Bugün onu seç.',
];

// Uygulama genelinde dönüşümlü kullanılabilen marka sloganları
export const MOTIVATIONAL_SLOGANS = [
  'Değişim bugün başlar.',
  'Güç tesadüf değildir.',
  'Disiplin sonuç getirir.',
  'Her gün bir adım daha ileri.',
  'Hedefine sadık kal.',
  'Güçlü olmak bir seçimdir.',
  'Bugün vazgeçmezsen yarın farklı olur.',
  'Kendinin en iyi versiyonunu oluştur.',
];

// Ana sayfada selamlamanın altında gösterilen motive edici satırlar
export const HOME_HEADLINES = [
  'Bugün kendin için attığın her adım, yarının sonucunu belirler.',
  'Disiplin bugün, sonuç yarın.',
  'Bugün de en iyi versiyonuna bir adım daha yaklaş.',
  'Güç, her gün gösterdiğin küçük çabalarda saklı.',
];

export const ONBOARDING_SLIDES = [
  {
    eyebrow: 'THE CHANGE PT STUDIO',
    title: 'Değişim bugün başlar.',
    description: 'Hedeflerine ulaşmak için ilk adımı at.',
  },
  {
    eyebrow: 'AMACINA ODAKLAN',
    title: 'Amacına uygun çalış.',
    description: 'Yağ yak, kas kazan veya formunu koru.',
  },
  {
    eyebrow: 'GELİŞİMİNİ GÖR',
    title: 'Gelişimini takip et.',
    description: 'Attığın her adımı kaydet ve ilerlemeni izle.',
  },
];

export const QUICK_ACCESS = [
  { id: 'fat_burn', label: 'Yağ Yakım', icon: 'flame' as const },
  { id: 'muscle_gain', label: 'Kas Kazanım', icon: 'barbell' as const },
  { id: 'core', label: 'Merkez', icon: 'body' as const },
  { id: 'home', label: 'Evde', icon: 'home' as const },
];

// ─── Admin panel etiketleri ─────────────────────────────────────────────────

export const TIER_LABELS: Record<string, string> = {
  free: 'Ücretsiz',
  premium: 'Premium',
  expired: 'Süresi Dolmuş',
};

export const AUDIENCE_LABELS: Record<string, string> = {
  all: 'Tüm Kullanıcılar',
  premium: 'Premium Kullanıcılar',
  free: 'Ücretsiz Kullanıcılar',
};

export const CONTENT_STATUS_LABELS: Record<string, string> = {
  published: 'Yayında',
  draft: 'Taslak',
  archived: 'Arşivde',
};

export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  active: 'Aktif',
  expired: 'Süresi Doldu',
  cancelled: 'İptal Edildi',
  trial: 'Deneme',
};

export const GENDER_LABELS: Record<string, string> = {
  male: 'Erkek',
  female: 'Kadın',
  other: 'Diğer',
};

// ─── Premium ────────────────────────────────────────────────────────────────

export const PREMIUM_CTA = "Premium'u Keşfet";

// Nazik yükseltme mesajları — özellik bazlı
export const UPGRADE_MESSAGES = {
  generic:
    'Premium ile sana özel programlara, ilerleme takibine ve koç deneyimine ulaşabilirsin.',
  program:
    'Premium ile sana özel program oluşturabilir ve gelişimini takip edebilirsin.',
  todayWorkout:
    'Premium ile her gün ne yapacağını bilirsin. Sana özel günlük antrenman planın hazır olur.',
  progress:
    'Premium ile kilo geçmişini, güç artışını ve toplam hacmini detaylı takip edebilirsin.',
} as const;

// Premium ekranındaki fayda kartları — agresif satış yok, gerçek fayda var
export const PREMIUM_BENEFITS = [
  {
    icon: 'person-outline' as const,
    label: 'Kişiye özel programlar',
    desc: 'Hedefine, seviyene ve haftalık planına göre hazırlanan antrenman programı',
  },
  {
    icon: 'today-outline' as const,
    label: 'Günlük antrenman planları',
    desc: 'Her gün ne yapacağını bil — düşünme, sadece antrenmana odaklan',
  },
  {
    icon: 'trending-up-outline' as const,
    label: 'İlerlemeni detaylı takip et',
    desc: 'Kilo geçmişi, güç artışı, toplam hacim ve seri takibi',
  },
  {
    icon: 'analytics-outline' as const,
    label: 'Performans analizleri',
    desc: 'Tamamlanan antrenmanlar ve haftalık gelişim raporları',
  },
  {
    icon: 'sparkles-outline' as const,
    label: 'Yapay Zeka Koç',
    desc: 'Antrenmanlarına göre kişisel öneriler',
    comingSoon: true,
  },
  {
    icon: 'restaurant-outline' as const,
    label: 'Beslenme Bölümü',
    desc: 'Hedefe uygun beslenme rehberi',
    comingSoon: true,
  },
];
