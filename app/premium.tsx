import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';

const FEATURES = [
  { icon: 'person-outline', label: 'Kişiye Özel Program', desc: 'Sana özel hazırlanmış antrenman planı' },
  { icon: 'headset-outline', label: 'PT Koç Kontrolü', desc: 'Haftalık PT geri bildirimi ve takip' },
  { icon: 'restaurant-outline', label: 'Beslenme Planı', desc: 'Hedefe uygun kişisel beslenme tablosu' },
  { icon: 'bar-chart-outline', label: 'Haftalık Rapor', desc: 'Detaylı ilerleme analizi ve öneriler' },
  { icon: 'videocam-outline', label: 'Form Analizi', desc: 'Video üzerinden hareket analizi' },
  { icon: 'play-circle-outline', label: 'Özel Video İçerikler', desc: '200+ premium video antrenman' },
];

const PLANS = [
  { id: 'monthly', label: 'Aylık', price: '₺299', period: '/ay', popular: false },
  { id: 'quarterly', label: '3 Aylık', price: '₺749', period: '/3 ay', popular: true, badge: 'En İyi Değer' },
  { id: 'yearly', label: 'Yıllık', price: '₺2.199', period: '/yıl', popular: false },
];

export default function PremiumScreen() {
  const handlePurchase = (planId: string) => {
    Alert.alert(
      'Yakında!',
      'Ödeme sistemi hazırlanıyor. Çok yakında açılacak!',
      [{ text: 'Tamam' }],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="close" size={24} color={colors.text} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.hero}>
          <View style={styles.goldBadge}>
            <Ionicons name="star" size={16} color={colors.background} />
            <Text style={styles.goldBadgeText}>PREMIUM</Text>
          </View>
          <Text style={styles.title}>Bir Sonraki{'\n'}Seviyene Çık</Text>
          <Text style={styles.subtitle}>
            Kişisel antrenörün artık cebinde. Premium ile hedeflerine en hızlı yolu al.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresList}>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon as React.ComponentProps<typeof Ionicons>['name']} size={22} color={colors.gold} />
              </View>
              <View style={styles.featureInfo}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Plans */}
        <Text style={styles.plansTitle}>Plan Seç</Text>
        <View style={styles.plansRow}>
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, plan.popular && styles.planCardPopular]}
              onPress={() => handlePurchase(plan.id)}
              activeOpacity={0.85}
            >
              {plan.popular && (
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>{plan.badge}</Text>
                </View>
              )}
              <Text style={styles.planLabel}>{plan.label}</Text>
              <Text style={[styles.planPrice, plan.popular && styles.planPricePopular]}>
                {plan.price}
              </Text>
              <Text style={styles.planPeriod}>{plan.period}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => handlePurchase('quarterly')}
          activeOpacity={0.85}
        >
          <Ionicons name="star" size={18} color={colors.background} />
          <Text style={styles.ctaLabel}>PREMIUM'A GEÇ</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          İstediğin zaman iptal edebilirsin. Gizlilik politikamız geçerlidir.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  closeBtn: {
    padding: spacing.md,
    alignSelf: 'flex-end',
  },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.xl },
  hero: { alignItems: 'center', gap: spacing.md },
  goldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  goldBadgeText: { ...typography.label, color: colors.background, fontWeight: '800' },
  title: {
    ...typography.hero,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 50,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: spacing.md,
  },
  featuresList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureInfo: { flex: 1 },
  featureLabel: { ...typography.bodyMedium, color: colors.text },
  featureDesc: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  plansTitle: { ...typography.h3, color: colors.text },
  plansRow: { flexDirection: 'row', gap: spacing.sm },
  planCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.xl,
    ...shadows.sm,
  },
  planCardPopular: {
    borderColor: colors.gold,
    backgroundColor: colors.goldMuted,
  },
  planBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  planBadgeText: { ...typography.caption, color: colors.background, fontWeight: '800' },
  planLabel: { ...typography.label, color: colors.textSecondary },
  planPrice: { ...typography.h3, color: colors.text },
  planPricePopular: { color: colors.gold },
  planPeriod: { ...typography.caption, color: colors.textMuted },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gold,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    ...shadows.gold,
  },
  ctaLabel: {
    ...typography.label,
    color: colors.background,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
