export const APP_NAME = 'The Change PT Studio';
export const APP_TAGLINE = 'Change starts today.';

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
  arms: 'Kol',
  legs: 'Bacak',
  core: 'Karın',
  cardio: 'Kardiyo',
  mobility: 'Mobilite',
  full_body: 'Tüm Vücut',
};

export const EQUIPMENT_LABELS: Record<string, string> = {
  none: 'Ekipmansız',
  dumbbells: 'Dumbbell',
  barbell: 'Barbell',
  machine: 'Makine',
  cables: 'Kablo',
  resistance_bands: 'Direnç Bandı',
  pull_up_bar: 'Barfiks',
  mixed: 'Karma',
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
  full_body: 'Full Body',
  core: 'Core',
  home: 'Evde',
  gym: 'Salon',
  beginner: 'Başlangıç',
};

export const COACH_NOTES = [
  'Bugün mükemmel olmak zorunda değilsin, sadece başlamalısın.',
  'Her tekrar seni bir adım daha yaklaştırır. Dur ma.',
  'Vücudun değişir. Önce zihnin değişmeli.',
  'Acı geçici, gurur kalıcıdır.',
  'Küçük adımlar büyük farklar yaratır.',
  'Bugün antrenman yaptın mı? Yarını daha iyi yapıyorsun.',
  'Disiplin motivasyondan güçlüdür.',
  'Hedefine ulaşmak bir maratondu, sprint değil.',
];

export const MOTIVATIONAL_SLOGANS = [
  'Change starts today.',
  'Train with purpose.',
  'Built for your next level.',
  'Your body. Your discipline. Your change.',
  'The day you decide is the day you change.',
];

export const ONBOARDING_SLIDES = [
  {
    title: 'Change starts today.',
    description:
      'Hedefine göre kişisel antrenman deneyimini oluştur. Sana özel, sana göre.',
  },
  {
    title: 'Train with purpose.',
    description:
      'Yağ yak, kas kazan, güçlen veya formunu koru. Hedefin ne olursa olsun, doğru programla başla.',
  },
  {
    title: 'Track your progress.',
    description:
      'Antrenmanlarını, kilonu ve gelişimini takip et. Her adım önemli, her ilerleme görünür.',
  },
];

export const QUICK_ACCESS = [
  { id: 'fat_burn', label: 'Yağ Yakım', icon: 'flame' as const },
  { id: 'muscle_gain', label: 'Kas Kazanım', icon: 'barbell' as const },
  { id: 'core', label: 'Core', icon: 'body' as const },
  { id: 'home', label: 'Evde', icon: 'home' as const },
];
