/**
 * The Change PT Studio — web landing page.
 *
 * Mobil uygulamayla aynı marka dili: koyu premium arka plan, neon yeşil
 * accent, geniş hero, temiz kartlar. Görsel alanları stüdyo fotoğrafları
 * eklenene kadar premium gradient bloklar olarak durur.
 *
 * Sadece web'de render edilir (app/index.tsx); admin paneline buradan
 * link VERİLMEZ — /admin yalnızca doğrudan adresle ve login ile açılır.
 */
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useUser } from '@/src/contexts/UserContext';
import { APP_NAME, APP_TAGLINE } from '@/src/constants/strings';
import { borderRadius, colors, gradients, shadows, spacing, typography } from '@/src/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

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
  { icon: 'images-outline',      title: 'Önce / Sonra',           desc: 'Dönüşüm fotoğraflarınla değişimini belgelele ve karşılaştır.' },
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

const HOW_IT_WORKS: { icon: IconName; step: string; title: string; desc: string }[] = [
  { icon: 'flag-outline',        step: '01', title: 'Hedefini seç',        desc: 'Yağ yakımı, kas kazanımı veya form koruma — planın hedefine göre şekillenir.' },
  { icon: 'school-outline',      step: '02', title: 'Hareketleri öğren',   desc: 'Video anlatımlar, ipuçları ve yaygın hatalarla her hareketi doğru formda yap.' },
  { icon: 'stats-chart-outline', step: '03', title: 'Gelişimini takip et', desc: 'Her antrenmanın kaydedilir; gücün, serin ve değişimin görünür hale gelir.' },
];

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Uygulama ücretsiz mi?',
    a: 'Evet. Egzersiz kütüphanesi, hareket açıklamaları, filtreler ve favoriler tamamen ücretsizdir. Kişisel program, günlük plan ve gelişim takibi Premium üyelikle açılır.',
  },
  {
    q: "Premium'da ne var?",
    a: 'Hedefine göre hazırlanan kişisel program, günlük antrenman planı, set set workout log, detaylı gelişim takibi, başarı rozetleri ve önce/sonra fotoğraf alanı Premium üyelere özeldir.',
  },
  {
    q: 'Egzersiz videoları nasıl ekleniyor?',
    a: 'Tüm hareket videoları ve görselleri stüdyo ekibi tarafından yönetim panelinden yüklenir ve uygulamaya anında yansır. İçerik kütüphanesi düzenli olarak genişler.',
  },
  {
    q: 'Yönetim paneli ne işe yarıyor?',
    a: 'Yönetim paneli işletme tarafına aittir: üyelikler, programlar, egzersiz içerikleri ve bildirimler buradan yönetilir. Son kullanıcı uygulaması bu panelden tamamen ayrıdır.',
  },
  {
    q: 'Verilerim güvende mi?',
    a: 'Antrenman geçmişin, ölçümlerin ve fotoğrafların cihazında saklanır; üçüncü taraflarla paylaşılmaz. Hesap ve abonelik işlemleri güvenli altyapı üzerinden yürütülür.',
  },
];

const CONTACT_ITEMS: { icon: IconName; label: string; value: string }[] = [
  { icon: 'mail-outline',          label: 'E-posta',   value: 'info@thechangept.com' },
  { icon: 'logo-instagram',        label: 'Instagram', value: '@thechangeptstudio' },
  { icon: 'logo-whatsapp',         label: 'WhatsApp',  value: '+90 (5xx) xxx xx xx' },
];

// ─── Sayfa ───────────────────────────────────────────────────────────────────

export function LandingPage() {
  const { width } = useWindowDimensions();
  const { isOnboardingComplete } = useUser();
  const isMobile = width < BREAKPOINT_MOBILE;
  const isTablet = width < BREAKPOINT_TABLET;

  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Record<string, number>>({});

  const registerSection = (key: string) => (e: { nativeEvent: { layout: { y: number } } }) => {
    sectionY.current[key] = e.nativeEvent.layout.y;
  };

  const scrollTo = (key: string) => {
    scrollRef.current?.scrollTo({ y: (sectionY.current[key] ?? 0) - 24, animated: true });
  };

  const openApp = () => {
    router.push(isOnboardingComplete ? '/(tabs)' : '/onboarding');
  };

  return (
    <View style={styles.root}>
      {/* Üst bar */}
      <View style={styles.navBar}>
        <View style={[styles.navInner, { maxWidth: MAX_WIDTH }]}>
          <View style={styles.brandRow}>
            <View style={styles.brandLogo}>
              <Ionicons name="barbell" size={18} color={colors.background} />
            </View>
            {!isMobile && <Text style={styles.brandName}>THE CHANGE PT STUDIO</Text>}
          </View>
          <View style={styles.navLinks}>
            {!isTablet && (
              <>
                <NavLink label="Özellikler"    onPress={() => scrollTo('features')} />
                <NavLink label="Premium"       onPress={() => scrollTo('premium')} />
                <NavLink label="Nasıl Çalışır" onPress={() => scrollTo('how')} />
                <NavLink label="SSS"           onPress={() => scrollTo('faq')} />
                <NavLink label="İletişim"      onPress={() => scrollTo('contact')} />
              </>
            )}
            <TouchableOpacity
              style={styles.navCta}
              onPress={openApp}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Uygulamayı aç"
            >
              <Text style={styles.navCtaLabel}>Uygulamayı Aç</Text>
            </TouchableOpacity>
          </View>
        </View>
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
                <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
                  {APP_NAME}
                </Text>
                <Text style={styles.heroTagline}>{APP_TAGLINE}</Text>
                <Text style={styles.heroDesc}>
                  Hedefine göre antrenman yap, hareketleri doğru formda öğren ve gelişimini
                  tek yerden takip et.
                </Text>
                <View style={styles.heroBtns}>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={openApp}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Uygulamayı keşfet"
                  >
                    <Ionicons name="rocket-outline" size={18} color={colors.background} />
                    <Text style={styles.primaryBtnLabel}>Uygulamayı Keşfet</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => scrollTo('premium')}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Premium özelliklerini incele"
                  >
                    <Ionicons name="star-outline" size={18} color={colors.accent} />
                    <Text style={styles.secondaryBtnLabel}>Premium&apos;u İncele</Text>
                  </TouchableOpacity>
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
                tall
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
            desc="Kütüphane herkese açık. Kişisel programın ve gelişim takibin Premium ile açılır."
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
              <TouchableOpacity
                style={[styles.primaryBtn, styles.tierCta]}
                onPress={openApp}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Premium'u uygulamada incele"
              >
                <Text style={styles.primaryBtnLabel}>Uygulamada İncele</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.background} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Nasıl çalışır ── */}
        <View style={[styles.section, { maxWidth: MAX_WIDTH }]} onLayout={registerSection('how')}>
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

          {/* Geniş görsel alanı */}
          <MediaFrame icon="fitness-outline" label="STÜDYO GÖRSELİ" style={styles.wideMedia} />
        </View>

        {/* ── İşletme tarafı (sade) ── */}
        <View style={[styles.section, { maxWidth: MAX_WIDTH }]}>
          <View style={styles.businessCard}>
            <LinearGradient
              colors={gradients.surfaceRaised}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.businessIcon}>
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.accent} />
            </View>
            <View style={styles.businessInfo}>
              <Text style={styles.businessTitle}>Profesyonel yönetim altyapısı</Text>
              <Text style={styles.businessDesc}>
                Üyelikler, programlar, egzersiz içerikleri ve bildirimler; işletmeye özel
                yönetim merkezi üzerinden uçtan uca yönetilir. Stüdyonun eklediği her içerik
                uygulamaya anında yansır.
              </Text>
            </View>
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

        {/* ── Kapanış CTA ── */}
        <View style={[styles.section, { maxWidth: MAX_WIDTH }]}>
          <View style={styles.finalCta}>
            <LinearGradient
              colors={gradients.accent}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={styles.finalCtaTitle}>Değişim bugün başlar.</Text>
            <Text style={styles.finalCtaDesc}>
              Egzersiz kütüphanesi ücretsiz — ilk hareketi öğrenmek bir dakika sürer.
            </Text>
            <TouchableOpacity
              style={styles.finalCtaBtn}
              onPress={openApp}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Uygulamayı hemen aç"
            >
              <Text style={styles.finalCtaBtnLabel}>HEMEN BAŞLA</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <View style={[styles.footerInner, { maxWidth: MAX_WIDTH }]}>
            <View style={styles.brandRow}>
              <View style={styles.brandLogo}>
                <Ionicons name="barbell" size={16} color={colors.background} />
              </View>
              <Text style={styles.footerBrand}>{APP_NAME}</Text>
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
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} accessibilityRole="link">
      <Text style={styles.navLink}>{label}</Text>
    </TouchableOpacity>
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
  style?: object;
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
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setOpen((o) => !o)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={question}
      accessibilityState={{ expanded: open }}
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
    </TouchableOpacity>
  );
}

// ─── Stiller ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },

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
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandLogo: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { ...typography.h4, color: colors.text, letterSpacing: 1.5 },
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  navLink: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '600' },
  navCta: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 1,
    ...shadows.accent,
  },
  navCtaLabel: { ...typography.bodySmall, color: colors.background, fontWeight: '800' },

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
  heroTitle: { ...typography.hero, fontSize: 56, lineHeight: 60, color: colors.text },
  heroTitleMobile: { fontSize: 38, lineHeight: 42 },
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
  },
  secondaryBtnLabel: { ...typography.bodyMedium, color: colors.accent, fontWeight: '800' },
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

  // İşletme
  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    overflow: 'hidden',
    flexWrap: 'wrap',
  },
  businessIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessInfo: { flex: 1, minWidth: 260, gap: spacing.xs },
  businessTitle: { ...typography.h3, color: colors.text },
  businessDesc: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },

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

  // Kapanış CTA
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
  finalCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md - 2,
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
  footerBrand: { ...typography.bodyMedium, color: colors.text, fontWeight: '700' },
  footerNote: { ...typography.caption, color: colors.textMuted },
});
