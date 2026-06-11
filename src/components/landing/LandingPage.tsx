/**
 * The Change PT Studio — premium showroom / tanıtım sitesi.
 *
 * Web sitesi yalnızca markayı ve mobil uygulamayı TANITIR:
 *  - Kayıt/giriş, premium satın alma, program takibi web'de YOKTUR;
 *    bunlar yalnızca mobil uygulamadadır (web rotaları app/_layout.tsx'te kapalı).
 *  - Tüm CTA'lar sayfa içi bölümlere veya indirme alanına kaydırır.
 *  - Admin paneline buradan link VERİLMEZ — /admin yalnızca doğrudan adresle
 *    ve admin login ile açılır.
 *
 * Mobil uygulamayla aynı marka dili: koyu premium arka plan, neon yeşil
 * accent, altın premium vurgusu. Görsel alanları stüdyo fotoğrafları
 * eklenene kadar premium gradient bloklar olarak durur.
 */
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  PressableStateCallbackType,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { BrandLogo } from '@/src/components/ui/BrandLogo';
import { APP_NAME, APP_TAGLINE } from '@/src/constants/strings';
import { borderRadius, colors, gradients, shadows, spacing, typography } from '@/src/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// ─── Etkileşim yardımcıları (hover/press akıcılığı) ─────────────────────────

/** Web'de transform/gölge/renk geçişlerini yumuşatır; native'de etkisizdir */
const webTransition = Platform.OS === 'web'
  ? ({
      transitionProperty: 'transform, box-shadow, background-color, border-color, opacity',
      transitionDuration: '180ms',
    } as unknown as ViewStyle)
  : undefined;

/** RN tipi `hovered`'ı içermez ama react-native-web sağlar */
function readPressState(state: PressableStateCallbackType): { hovered: boolean; pressed: boolean } {
  const s = state as unknown as { hovered?: boolean; pressed: boolean };
  return { hovered: !!s.hovered, pressed: s.pressed };
}

/** Hover'da yükselip parlayan, basışta yaylanan buton sarmalayıcısı */
function LiftButton({
  style,
  hoverStyle,
  onPress,
  label,
  children,
}: {
  style: StyleProp<ViewStyle>;
  hoverStyle?: StyleProp<ViewStyle>;
  onPress: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={(state) => {
        const { hovered, pressed } = readPressState(state);
        return [
          style,
          webTransition,
          hovered && !pressed && styles.liftHovered,
          hovered && !pressed && hoverStyle,
          pressed && styles.liftPressed,
        ];
      }}
    >
      {children}
    </Pressable>
  );
}

const MAX_WIDTH = 1140;
const BREAKPOINT_TABLET = 900;
const BREAKPOINT_MOBILE = 600;

// ─── İçerik ──────────────────────────────────────────────────────────────────

const APP_FEATURES: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'barbell-outline',     title: 'Egzersiz Kütüphanesi',  desc: 'Kas grubu, ortam ve ekipmana göre filtrelenen kapsamlı hareket arşivi.' },
  { icon: 'videocam-outline',    title: 'Hareket Videoları',      desc: 'Her hareketi doğru formda öğreten video ve görsel anlatımlar.' },
  { icon: 'heart-outline',       title: 'Favoriler',              desc: 'Sevdiğin hareketleri kaydet, antrenmanında hızlıca ulaş.' },
  { icon: 'albums-outline',      title: 'Premium Programlar',     desc: 'Hedefine ve seviyene göre hazırlanan haftalık antrenman programları.' },
  { icon: 'trending-up-outline', title: 'Gelişim Takibi',         desc: 'Kilo, hacim, seri ve antrenman geçmişini tek ekrandan izle.' },
  { icon: 'images-outline',      title: 'Önce / Sonra',           desc: 'Dönüşüm fotoğraflarınla değişimini belgele ve karşılaştır.' },
  { icon: 'notifications-outline', title: 'Akıllı Bildirimler',   desc: 'Antrenman hatırlatmaları ve motivasyon mesajlarıyla ritmini koru.' },
  { icon: 'trophy-outline',      title: 'Başarı Rozetleri',       desc: 'Seriler, tamamlanan antrenmanlar ve güç artışıyla rozet kazan.' },
];

const FREE_FEATURES = [
  'Egzersiz kütüphanesi',
  'Hareket açıklamaları ve doğru form',
  'Kas grubu filtreleri',
  'Ekipman ve ortam filtreleri',
  'Favori hareketler',
];

const PREMIUM_FEATURES = [
  'Kişiye özel antrenman programı',
  'Günlük antrenman planı',
  'Detaylı gelişim takibi',
  'Set set workout log',
  'Başarı rozetleri',
  'Önce / sonra fotoğraf alanı',
];

const MUSCLE_GROUPS: { icon: IconName; label: string }[] = [
  { icon: 'body-outline',      label: 'Göğüs' },
  { icon: 'body-outline',      label: 'Sırt' },
  { icon: 'body-outline',      label: 'Omuz' },
  { icon: 'body-outline',      label: 'Kol' },
  { icon: 'body-outline',      label: 'Bacak' },
  { icon: 'body-outline',      label: 'Core' },
  { icon: 'walk-outline',      label: 'Kardiyo' },
  { icon: 'accessibility-outline', label: 'Mobilite' },
];

const PROGRESS_HIGHLIGHTS: { icon: IconName; value: string; label: string; desc: string }[] = [
  { icon: 'flame-outline',       value: '12 gün',  label: 'SERİ',          desc: 'Üst üste antrenman günlerinle motivasyonunu koru.' },
  { icon: 'calendar-outline',    value: '4/4',     label: 'HAFTALIK PLAN', desc: 'Haftalık hedefini tamamla, ritmini hiç bozma.' },
  { icon: 'stats-chart-outline', value: '12.4 t',  label: 'TOPLAM HACİM',  desc: 'Kaldırdığın toplam ağırlığı set set izle.' },
];

const HOW_IT_WORKS: { icon: IconName; step: string; title: string; desc: string }[] = [
  { icon: 'flag-outline',        step: '01', title: 'Hedefini seç',        desc: 'Yağ yakımı, kas kazanımı veya form koruma — planın hedefine göre şekillenir.' },
  { icon: 'school-outline',      step: '02', title: 'Hareketleri öğren',   desc: 'Video anlatımlar, ipuçları ve yaygın hatalarla her hareketi doğru formda yap.' },
  { icon: 'stats-chart-outline', step: '03', title: 'Gelişimini takip et', desc: 'Her antrenmanın kaydedilir; gücün, serin ve değişimin görünür hale gelir.' },
];

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Uygulamayı nereden indirebilirim?',
    a: 'The Change PT Studio çok yakında App Store ve Google Play\'de yayında olacak. Yayınlandığında bu sayfadaki indirme butonları aktif hale gelecek.',
  },
  {
    q: 'Uygulama ücretsiz mi?',
    a: 'Evet. Egzersiz kütüphanesi, hareket açıklamaları, filtreler ve favoriler tamamen ücretsizdir. Kişisel program, günlük plan ve gelişim takibi Premium üyelikle açılır.',
  },
  {
    q: "Premium'da ne var?",
    a: 'Hedefine göre hazırlanan kişisel program, günlük antrenman planı, set set workout log, detaylı gelişim takibi, başarı rozetleri ve önce/sonra fotoğraf alanı Premium üyelere özeldir.',
  },
  {
    q: 'Üyelik ve premium işlemleri nereden yapılıyor?',
    a: 'Kayıt, giriş ve premium üyelik işlemlerinin tamamı mobil uygulama içindedir. Web sitesi yalnızca tanıtım amaçlıdır.',
  },
  {
    q: 'Verilerim güvende mi?',
    a: 'Antrenman geçmişin, ölçümlerin ve fotoğrafların hesabına özel ve güvenli altyapıda saklanır; üçüncü taraflarla paylaşılmaz.',
  },
];

const CONTACT_ITEMS: { icon: IconName; label: string; value: string }[] = [
  { icon: 'mail-outline',          label: 'E-posta',   value: 'info@thechangept.com' },
  { icon: 'logo-instagram',        label: 'Instagram', value: '@thechangeptstudio' },
  { icon: 'logo-whatsapp',         label: 'WhatsApp',  value: '+90 (5xx) xxx xx xx' },
];

const NAV_ITEMS: { key: string; label: string }[] = [
  { key: 'features', label: 'Özellikler' },
  { key: 'premium',  label: 'Premium' },
  { key: 'library',  label: 'Egzersizler' },
  { key: 'progress', label: 'Gelişim' },
  { key: 'faq',      label: 'SSS' },
  { key: 'contact',  label: 'İletişim' },
];

// ─── Sayfa ───────────────────────────────────────────────────────────────────

export function LandingPage() {
  const { width } = useWindowDimensions();
  const isMobile = width < BREAKPOINT_MOBILE;
  const isTablet = width < BREAKPOINT_TABLET;
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Record<string, number>>({});

  const registerSection = (key: string) => (e: { nativeEvent: { layout: { y: number } } }) => {
    sectionY.current[key] = e.nativeEvent.layout.y;
  };

  const scrollTo = (key: string) => {
    setMenuOpen(false);
    scrollRef.current?.scrollTo({ y: (sectionY.current[key] ?? 0) - 24, animated: true });
  };

  return (
    <View style={styles.root}>
      {/* Üst bar */}
      <View style={styles.navBar}>
        <View style={[styles.navInner, { maxWidth: MAX_WIDTH }]}>
          <View style={styles.brandRow}>
            <BrandLogo height={isMobile ? 28 : 34} />
          </View>
          <View style={styles.navLinks}>
            {!isTablet &&
              NAV_ITEMS.map((item) => (
                <NavLink key={item.key} label={item.label} onPress={() => scrollTo(item.key)} />
              ))}
            <LiftButton
              style={styles.navCta}
              hoverStyle={styles.glowHover}
              onPress={() => scrollTo('download')}
              label="Uygulamayı indir"
            >
              <Text style={styles.navCtaLabel}>{isMobile ? 'İndir' : 'Uygulamayı İndir'}</Text>
            </LiftButton>
            {isTablet && (
              <Pressable
                onPress={() => setMenuOpen((o) => !o)}
                accessibilityRole="button"
                accessibilityLabel={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
                style={styles.menuBtn}
              >
                <Ionicons
                  name={menuOpen ? 'close' : 'menu'}
                  size={24}
                  color={menuOpen ? colors.accent : colors.text}
                />
              </Pressable>
            )}
          </View>
        </View>

        {/* Mobil hamburger menü */}
        {isTablet && menuOpen && (
          <View style={[styles.mobileMenu, { maxWidth: MAX_WIDTH }]}>
            {NAV_ITEMS.map((item) => (
              <Pressable
                key={item.key}
                onPress={() => scrollTo(item.key)}
                accessibilityRole="link"
                accessibilityLabel={item.label}
                style={(state) => [
                  styles.mobileMenuItem,
                  readPressState(state).pressed && styles.mobileMenuItemPressed,
                ]}
              >
                <Text style={styles.mobileMenuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <ScrollView ref={scrollRef} style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Hero ── */}
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={['rgba(197,241,53,0.10)', 'rgba(197,241,53,0.02)', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          <View style={[styles.section, { maxWidth: MAX_WIDTH }]}>
            <View style={[styles.heroGrid, isTablet && styles.heroGridStacked]}>
              <View style={styles.heroText}>
                <View style={styles.heroEyebrow}>
                  <View style={styles.dot} />
                  <Text style={styles.heroEyebrowText}>KİŞİSEL ANTRENMAN UYGULAMASI</Text>
                </View>
                {/* Marka hissi: hero'da büyük resmi logo */}
                <BrandLogo height={isMobile ? 64 : 110} />

                <Text style={styles.heroTagline}>{APP_TAGLINE}</Text>
                <Text style={styles.heroDesc}>
                  Hedefine göre antrenman yap, hareketleri doğru formda öğren ve gelişimini
                  tek yerden takip et — hepsi cebindeki uygulamada.
                </Text>
                <View style={styles.heroBtns}>
                  <LiftButton
                    style={styles.primaryBtn}
                    hoverStyle={styles.glowHover}
                    onPress={() => scrollTo('features')}
                    label="Uygulamayı keşfet"
                  >
                    <Ionicons name="rocket-outline" size={18} color={colors.background} />
                    <Text style={styles.primaryBtnLabel}>Uygulamayı Keşfet</Text>
                  </LiftButton>
                  <LiftButton
                    style={styles.secondaryBtn}
                    hoverStyle={styles.secondaryHover}
                    onPress={() => scrollTo('premium')}
                    label="Premium özelliklerini incele"
                  >
                    <Ionicons name="star-outline" size={18} color={colors.accent} />
                    <Text style={styles.secondaryBtnLabel}>Premium&apos;u İncele</Text>
                  </LiftButton>
                </View>

                {/* Mağaza rozetleri (placeholder — yayınla birlikte aktifleşir) */}
                <View style={styles.storeBadges}>
                  <StoreBadge store="apple" />
                  <StoreBadge store="google" />
                </View>

                <View style={styles.heroStats}>
                  <HeroStat value="34+" label="Hareket" />
                  <View style={styles.heroStatDivider} />
                  <HeroStat value="5+" label="Program" />
                  <View style={styles.heroStatDivider} />
                  <HeroStat value="%100" label="Türkçe" />
                </View>
              </View>

              {/* Hero görsel alanı */}
              <MediaFrame
                icon="phone-portrait-outline"
                label="UYGULAMA GÖRSELİ"
                style={[styles.heroMedia, isTablet && styles.heroMediaStacked]}
                tall={!isMobile}
              />
            </View>
          </View>
        </View>

        {/* ── Uygulama tanıtımı ── */}
        <View style={[styles.section, { maxWidth: MAX_WIDTH }]} onLayout={registerSection('features')}>
          <SectionHeading
            eyebrow="UYGULAMA"
            title="Cebindeki antrenman stüdyosu"
            desc="The Change PT Studio; hareket öğrenmekten program takibine kadar tüm antrenman deneyimini tek uygulamada toplar."
          />
          <View style={styles.featureGrid}>
            {APP_FEATURES.map((f) => (
              <View
                key={f.title}
                style={[
                  styles.featureCard,
                  { width: isMobile ? '100%' : isTablet ? '47%' : '23.5%' },
                ]}
              >
                <View style={styles.featureIcon}>
                  <Ionicons name={f.icon} size={22} color={colors.accent} />
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Ücretsiz vs Premium ── */}
        <View style={[styles.section, { maxWidth: MAX_WIDTH }]} onLayout={registerSection('premium')}>
          <SectionHeading
            eyebrow="ÜYELİK"
            title="Ücretsiz başla, hazır olunca yüksel"
            desc="Kütüphane herkese açık. Kişisel programın ve gelişim takibin Premium ile açılır. Tüm üyelik işlemleri mobil uygulama içindedir."
          />
          <View style={[styles.tierGrid, isTablet && styles.tierGridStacked]}>
            {/* Ücretsiz */}
            <View style={styles.tierCard}>
              <View style={styles.tierHeader}>
                <View style={styles.tierBadgeFree}>
                  <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.tierBadgeFreeText}>ÜCRETSİZ</Text>
                </View>
                <Text style={styles.tierTitle}>Keşfet ve Öğren</Text>
                <Text style={styles.tierDesc}>Doğru formu öğrenmek için ihtiyacın olan her şey.</Text>
              </View>
              {FREE_FEATURES.map((f) => (
                <TierRow key={f} label={f} tone="free" />
              ))}
            </View>

            {/* Premium */}
            <View style={[styles.tierCard, styles.tierCardPremium]}>
              <LinearGradient
                colors={['rgba(212,168,67,0.12)', 'transparent']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
              <View style={styles.tierHeader}>
                <View style={styles.tierBadgePremium}>
                  <Ionicons name="star" size={14} color={colors.background} />
                  <Text style={styles.tierBadgePremiumText}>PREMIUM</Text>
                </View>
                <Text style={styles.tierTitle}>Dönüşümünü Yönet</Text>
                <Text style={styles.tierDesc}>Sana özel plan, takip ve koç deneyimi.</Text>
              </View>
              {PREMIUM_FEATURES.map((f) => (
                <TierRow key={f} label={f} tone="premium" />
              ))}
              <LiftButton
                style={[styles.primaryBtn, styles.tierCta]}
                hoverStyle={styles.glowHover}
                onPress={() => scrollTo('download')}
                label="Uygulamayı indir"
              >
                <Text style={styles.primaryBtnLabel}>Uygulamada Keşfet</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.background} />
              </LiftButton>
            </View>
          </View>
        </View>

        {/* ── Egzersiz kütüphanesi tanıtımı ── */}
        <View style={[styles.section, { maxWidth: MAX_WIDTH }]} onLayout={registerSection('library')}>
          <SectionHeading
            eyebrow="EGZERSİZ KÜTÜPHANESİ"
            title="Her hareket, doğru formuyla"
            desc="34+ hareket; video anlatım, ipuçları, yaygın hatalar ve alternatifleriyle birlikte. Kas grubuna, ekipmana ve antrenman ortamına göre filtrele."
          />
          <View style={[styles.libraryGrid, isTablet && styles.libraryGridStacked]}>
            <View style={styles.libraryInfo}>
              <View style={styles.muscleChips}>
                {MUSCLE_GROUPS.map((m) => (
                  <View key={m.label} style={styles.muscleChip}>
                    <Ionicons name={m.icon} size={14} color={colors.accent} />
                    <Text style={styles.muscleChipLabel}>{m.label}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.libraryPoints}>
                <TierRow label="Adım adım hareket anlatımı" tone="free" />
                <TierRow label="Video ve görsel destekli öğrenme" tone="free" />
                <TierRow label="Yaygın hatalar ve düzeltmeleri" tone="free" />
                <TierRow label="Evde, salonda veya dışarıda alternatifler" tone="free" />
              </View>
              <LiftButton
                style={[styles.secondaryBtn, styles.libraryCta]}
                hoverStyle={styles.secondaryHover}
                onPress={() => scrollTo('download')}
                label="Egzersizleri incele"
              >
                <Ionicons name="barbell-outline" size={18} color={colors.accent} />
                <Text style={styles.secondaryBtnLabel}>Egzersizleri İncele</Text>
              </LiftButton>
            </View>
            <MediaFrame
              icon="barbell-outline"
              label="EGZERSİZ GÖRSELİ"
              style={[styles.libraryMedia, isTablet && styles.heroMediaStacked]}
            />
          </View>
        </View>

        {/* ── Gelişim takibi tanıtımı ── */}
        <View style={[styles.section, { maxWidth: MAX_WIDTH }]} onLayout={registerSection('progress')}>
          <SectionHeading
            eyebrow="GELİŞİM TAKİBİ"
            title="Değişimin görünür olsun"
            desc="Her antrenman kaydedilir: set, tekrar, ağırlık, süre ve hacim. Serin, haftalık ritmin ve önce/sonra fotoğraflarınla ilerlemen tek ekranda."
          />
          <View style={[styles.progressGrid, isTablet && styles.stepsGridStacked]}>
            {PROGRESS_HIGHLIGHTS.map((p) => (
              <View key={p.label} style={styles.progressCard}>
                <View style={styles.featureIcon}>
                  <Ionicons name={p.icon} size={22} color={colors.accent} />
                </View>
                <Text style={styles.progressValue}>{p.value}</Text>
                <Text style={styles.progressLabel}>{p.label}</Text>
                <Text style={styles.featureDesc}>{p.desc}</Text>
              </View>
            ))}
          </View>
          <MediaFrame icon="trending-up-outline" label="GELİŞİM EKRANI GÖRSELİ" style={styles.wideMedia} />
        </View>

        {/* ── Nasıl çalışır ── */}
        <View style={[styles.section, { maxWidth: MAX_WIDTH }]}>
          <SectionHeading
            eyebrow="NASIL ÇALIŞIR"
            title="Üç adımda değişim"
            desc="Karmaşık planlar yok. Hedef, öğrenme ve takip — hepsi bu."
          />
          <View style={[styles.stepsGrid, isTablet && styles.stepsGridStacked]}>
            {HOW_IT_WORKS.map((s) => (
              <View key={s.step} style={styles.stepCard}>
                <Text style={styles.stepNumber}>{s.step}</Text>
                <View style={styles.stepIcon}>
                  <Ionicons name={s.icon} size={24} color={colors.accent} />
                </View>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── SSS ── */}
        <View style={[styles.section, { maxWidth: MAX_WIDTH }]} onLayout={registerSection('faq')}>
          <SectionHeading eyebrow="SSS" title="Merak edilenler" />
          <View style={styles.faqList}>
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.q} question={item.q} answer={item.a} />
            ))}
          </View>
        </View>

        {/* ── İletişim ── */}
        <View style={[styles.section, { maxWidth: MAX_WIDTH }]} onLayout={registerSection('contact')}>
          <SectionHeading
            eyebrow="İLETİŞİM"
            title="Bize ulaş"
            desc="Üyelik, stüdyo ve iş birlikleri için her kanaldan yazabilirsin."
          />
          <View style={[styles.contactGrid, isTablet && styles.contactGridStacked]}>
            {CONTACT_ITEMS.map((c) => (
              <View key={c.label} style={styles.contactCard}>
                <View style={styles.contactIcon}>
                  <Ionicons name={c.icon} size={20} color={colors.accent} />
                </View>
                <Text style={styles.contactLabel}>{c.label}</Text>
                <Text style={styles.contactValue}>{c.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── İndirme / kapanış CTA ── */}
        <View style={[styles.section, { maxWidth: MAX_WIDTH }]} onLayout={registerSection('download')}>
          <View style={styles.finalCta}>
            <LinearGradient
              colors={gradients.accent}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={styles.finalCtaTitle}>Değişim bugün başlar.</Text>
            <Text style={styles.finalCtaDesc}>
              The Change PT Studio çok yakında App Store ve Google Play&apos;de.
            </Text>
            <View style={styles.finalBadges}>
              <StoreBadge store="apple" onDark />
              <StoreBadge store="google" onDark />
            </View>
            <LiftButton
              style={styles.finalCtaBtn}
              hoverStyle={styles.finalCtaHover}
              onPress={() => scrollTo('contact')}
              label="İletişime geç"
            >
              <Text style={styles.finalCtaBtnLabel}>İLETİŞİME GEÇ</Text>
              <Ionicons name="chatbubbles-outline" size={18} color={colors.accent} />
            </LiftButton>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <View style={[styles.footerInner, { maxWidth: MAX_WIDTH }]}>
            <View style={styles.brandRow}>
              <BrandLogo height={26} />
            </View>
            <Text style={styles.footerNote}>
              © {new Date().getFullYear()} {APP_NAME} · Tüm hakları saklıdır
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Alt bileşenler ──────────────────────────────────────────────────────────

function NavLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel={label}>
      {(state) => {
        const { hovered, pressed } = readPressState(state);
        return (
          <Text
            style={[
              styles.navLink,
              webTransition as object,
              (hovered || pressed) && styles.navLinkHovered,
            ]}
          >
            {label}
          </Text>
        );
      }}
    </Pressable>
  );
}

/** Mağaza rozeti placeholder'ı — uygulama yayınlanınca gerçek linke bağlanır */
function StoreBadge({ store, onDark }: { store: 'apple' | 'google'; onDark?: boolean }) {
  return (
    <View style={[styles.storeBadge, onDark && styles.storeBadgeOnDark]}>
      <Ionicons
        name={store === 'apple' ? 'logo-apple' : 'logo-google-playstore'}
        size={22}
        color={onDark ? colors.background : colors.text}
      />
      <View>
        <Text style={[styles.storeBadgeTop, onDark && styles.storeBadgeTopOnDark]}>YAKINDA</Text>
        <Text style={[styles.storeBadgeName, onDark && styles.storeBadgeNameOnDark]}>
          {store === 'apple' ? 'App Store' : 'Google Play'}
        </Text>
      </View>
    </View>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function SectionHeading({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!desc && <Text style={styles.sectionDesc}>{desc}</Text>}
    </View>
  );
}

/** Premium görünümlü görsel alanı — fotoğraf/video sonradan eklenecek */
function MediaFrame({
  icon, label, style, tall,
}: {
  icon: IconName;
  label: string;
  style?: StyleProp<ViewStyle>;
  tall?: boolean;
}) {
  return (
    <View style={[styles.mediaFrame, tall && styles.mediaFrameTall, style]}>
      <LinearGradient
        colors={['#222222', '#141414']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={['rgba(197,241,53,0.14)', 'transparent']}
        style={styles.mediaGlow}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
      />
      <View style={styles.mediaIconWrap}>
        <Ionicons name={icon} size={30} color={colors.accent} />
      </View>
      <Text style={styles.mediaLabel}>{label}</Text>
    </View>
  );
}

function TierRow({ label, tone }: { label: string; tone: 'free' | 'premium' }) {
  return (
    <View style={styles.tierRow}>
      <Ionicons
        name="checkmark-circle"
        size={18}
        color={tone === 'premium' ? colors.gold : colors.accent}
      />
      <Text style={styles.tierRowLabel}>{label}</Text>
    </View>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable
      onPress={() => setOpen((o) => !o)}
      accessibilityRole="button"
      accessibilityLabel={question}
      accessibilityState={{ expanded: open }}
      style={(state) => {
        const { hovered } = readPressState(state);
        return [
          styles.faqItem,
          webTransition,
          (hovered || open) && styles.faqItemActive,
        ];
      }}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons
          name={open ? 'remove' : 'add'}
          size={20}
          color={open ? colors.accent : colors.textSecondary}
        />
      </View>
      {open && <Text style={styles.faqAnswer}>{answer}</Text>}
    </Pressable>
  );
}

// ─── Stiller ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },

  // Etkileşim durumları
  liftHovered: { transform: [{ translateY: -2 }, { scale: 1.02 }] },
  liftPressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
  glowHover: { shadowOpacity: 0.55, shadowRadius: 20 },
  secondaryHover: { backgroundColor: colors.accentMuted, shadowColor: colors.accent, shadowOpacity: 0.25, shadowRadius: 14 },
  finalCtaHover: { shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 16 },
  navLinkHovered: { color: colors.accent },
  faqItemActive: { borderColor: colors.accent, backgroundColor: colors.surfaceSecondary },

  // Nav
  navBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  navInner: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 4,
    gap: spacing.md,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  navLink: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '600', paddingVertical: spacing.sm },
  navCta: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 3,
    minHeight: 44,
    justifyContent: 'center',
    ...shadows.accent,
  },
  navCtaLabel: { ...typography.bodySmall, color: colors.background, fontWeight: '800' },
  menuBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  // Hamburger menü
  mobileMenu: {
    width: '100%',
    alignSelf: 'center',
    paddingBottom: spacing.sm,
    gap: 2,
  },
  mobileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 6,
    minHeight: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mobileMenuItemPressed: { backgroundColor: colors.surfaceSecondary, borderColor: colors.accent },
  mobileMenuLabel: { ...typography.bodyMedium, color: colors.text, fontWeight: '600' },

  // Ortak section
  section: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    gap: spacing.lg,
  },
  sectionHeading: { gap: spacing.sm, maxWidth: 640 },
  sectionEyebrow: { ...typography.label, color: colors.accent, letterSpacing: 2 },
  sectionTitle: { ...typography.h1, color: colors.text },
  sectionDesc: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },

  // Hero
  heroWrap: { overflow: 'hidden' },
  heroGrid: { flexDirection: 'row', gap: spacing.xl, alignItems: 'center' },
  heroGridStacked: { flexDirection: 'column', alignItems: 'stretch' },
  heroText: { flex: 1, gap: spacing.md, paddingVertical: spacing.lg },
  heroEyebrow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  heroEyebrowText: { ...typography.label, color: colors.textSecondary, letterSpacing: 2 },
  heroTagline: { ...typography.h3, color: colors.accent },
  heroDesc: { ...typography.body, color: colors.textSecondary, lineHeight: 26, maxWidth: 520 },
  heroBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md - 2,
    minHeight: 48,
    ...shadows.accent,
  },
  primaryBtnLabel: { ...typography.bodyMedium, color: colors.background, fontWeight: '800' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md - 2,
    minHeight: 48,
  },
  secondaryBtnLabel: { ...typography.bodyMedium, color: colors.accent, fontWeight: '800' },

  // Mağaza rozetleri
  storeBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 52,
    opacity: 0.92,
  },
  storeBadgeOnDark: {
    backgroundColor: 'rgba(13,13,13,0.85)',
    borderColor: 'rgba(13,13,13,0.9)',
  },
  storeBadgeTop: { ...typography.caption, color: colors.textMuted, letterSpacing: 1.5, fontSize: 9 },
  storeBadgeTopOnDark: { color: colors.textSecondary },
  storeBadgeName: { ...typography.bodyMedium, color: colors.text, fontWeight: '800' },
  storeBadgeNameOnDark: { color: colors.text },

  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  heroStat: { gap: 2 },
  heroStatValue: { ...typography.h2, color: colors.text },
  heroStatLabel: { ...typography.caption, color: colors.textSecondary, letterSpacing: 1 },
  heroStatDivider: { width: 1, height: 34, backgroundColor: colors.border },
  heroMedia: { flex: 1, maxWidth: 420 },
  heroMediaStacked: { maxWidth: '100%' },

  // Görsel alanı
  mediaFrame: {
    height: 280,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    overflow: 'hidden',
    ...shadows.md,
  },
  mediaFrameTall: { height: 440 },
  mediaGlow: { position: 'absolute', top: 0, right: 0, width: '60%', height: '60%' },
  mediaIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaLabel: { ...typography.caption, color: colors.textMuted, letterSpacing: 2 },
  wideMedia: { height: 300, marginTop: spacing.md },

  // Özellik kartları
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  featureCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    minWidth: 220,
    flexGrow: 1,
    ...shadows.sm,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: { ...typography.h4, color: colors.text },
  featureDesc: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 19 },

  // Üyelik kartları
  tierGrid: { flexDirection: 'row', gap: spacing.md, alignItems: 'stretch' },
  tierGridStacked: { flexDirection: 'column' },
  tierCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm + 2,
    overflow: 'hidden',
    ...shadows.sm,
  },
  tierCardPremium: { borderColor: colors.gold, ...shadows.gold },
  tierHeader: { gap: spacing.sm, marginBottom: spacing.sm },
  tierBadgeFree: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceTertiary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  tierBadgeFreeText: { ...typography.caption, color: colors.textSecondary, fontWeight: '800', letterSpacing: 1 },
  tierBadgePremium: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  tierBadgePremiumText: { ...typography.caption, color: colors.background, fontWeight: '800', letterSpacing: 1 },
  tierTitle: { ...typography.h3, color: colors.text },
  tierDesc: { ...typography.bodySmall, color: colors.textSecondary },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tierRowLabel: { ...typography.bodyMedium, color: colors.text, flex: 1 },
  tierCta: { marginTop: spacing.md, alignSelf: 'flex-start' },

  // Egzersiz kütüphanesi
  libraryGrid: { flexDirection: 'row', gap: spacing.xl, alignItems: 'center' },
  libraryGridStacked: { flexDirection: 'column', alignItems: 'stretch' },
  libraryInfo: { flex: 1, gap: spacing.md },
  libraryMedia: { flex: 1, maxWidth: 480, height: 320 },
  libraryCta: { alignSelf: 'flex-start' },
  muscleChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  muscleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 4,
  },
  muscleChipLabel: { ...typography.bodySmall, color: colors.text, fontWeight: '600' },
  libraryPoints: { gap: spacing.sm },

  // Gelişim takibi
  progressGrid: { flexDirection: 'row', gap: spacing.md },
  progressCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  progressValue: { ...typography.h1, color: colors.accent },
  progressLabel: { ...typography.caption, color: colors.textSecondary, letterSpacing: 1.5, fontWeight: '700' },

  // Adımlar
  stepsGrid: { flexDirection: 'row', gap: spacing.md },
  stepsGridStacked: { flexDirection: 'column' },
  stepCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  stepNumber: { ...typography.hero, fontSize: 40, lineHeight: 44, color: colors.accentMuted },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: { ...typography.h3, color: colors.text },
  stepDesc: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },

  // SSS
  faqList: { gap: spacing.sm },
  faqItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  faqQuestion: { ...typography.bodyMedium, color: colors.text, fontWeight: '700', flex: 1 },
  faqAnswer: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 21 },

  // İletişim
  contactGrid: { flexDirection: 'row', gap: spacing.md },
  contactGridStacked: { flexDirection: 'column' },
  contactCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
    alignItems: 'flex-start',
  },
  contactIcon: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  contactLabel: { ...typography.label, color: colors.textSecondary, letterSpacing: 1 },
  contactValue: { ...typography.bodyMedium, color: colors.text, fontWeight: '600' },

  // İndirme / kapanış CTA
  finalCta: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    overflow: 'hidden',
    ...shadows.accent,
  },
  finalCtaTitle: { ...typography.h1, color: colors.background, textAlign: 'center' },
  finalCtaDesc: { ...typography.body, color: colors.background, opacity: 0.8, textAlign: 'center' },
  finalBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  finalCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md - 2,
    minHeight: 48,
    marginTop: spacing.sm,
  },
  finalCtaBtnLabel: { ...typography.label, color: colors.accent, fontWeight: '800', letterSpacing: 1 },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
  },
  footerInner: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  footerNote: { ...typography.caption, color: colors.textMuted },
});
