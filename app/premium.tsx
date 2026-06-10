import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandLogo } from '@/src/components/ui/BrandLogo';
import { useUser } from '@/src/contexts/UserContext';
import { PREMIUM_BENEFITS } from '@/src/constants/strings';
import { listPlans, purchasePlan } from '@/src/services/paymentService';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';
import { SubscriptionPlanId } from '@/src/types/admin';
import { formatShortDate } from '@/src/utils/formatters';
import { notify } from '@/src/utils/notify';
import { hapticSuccess } from '@/src/utils/haptics';

const PLAN_PERIOD_LABELS: Record<SubscriptionPlanId, string> = {
  monthly: '/ay',
  quarterly: '/3 ay',
  yearly: '/yıl',
};

const PLANS = listPlans().map((p) => ({
  id: p.id,
  label: p.label,
  price: `₺${p.priceTRY.toLocaleString('tr-TR')}`,
  period: PLAN_PERIOD_LABELS[p.id],
  popular: p.id === 'quarterly',
  badge: p.id === 'quarterly' ? 'En İyi Değer' : undefined,
}));

export default function PremiumScreen() {
  const { isPremium, setMembership } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>('quarterly');
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    if (purchasing) return;
    setPurchasing(true);
    try {
      const result = await purchasePlan(selectedPlan);
      if (!result.success) {
        notify('Satın Alma Başarısız', result.error ?? 'Lütfen tekrar dene.');
        return;
      }
      await setMembership('premium');
      hapticSuccess();
      notify(
        'Premium Aktif',
        result.expiresAt
          ? `Üyeliğin ${formatShortDate(result.expiresAt)} tarihine kadar geçerli. İyi antrenmanlar!`
          : 'Premium üyeliğin aktifleşti. İyi antrenmanlar!',
      );
      router.back();
    } finally {
      setPurchasing(false);
    }
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
        {/* Header — value first, no pressure */}
        <View style={styles.hero}>
          {/* Altın logo, premium kimliği destekler */}
          <BrandLogo height={42} />
          <View style={styles.goldBadge}>
            <Ionicons name="star" size={16} color={colors.background} />
            <Text style={styles.goldBadgeText}>PREMIUM</Text>
          </View>
          <Text style={styles.title}>Ne Yapacağını{'\n'}Bilen Kişi Ol</Text>
          <Text style={styles.subtitle}>
            Hareketleri zaten öğreniyorsun. Premium ile artık her gün ne yapacağını bilir, gelişimini adım adım görürsün.
          </Text>
        </View>

        {/* Already premium */}
        {isPremium && (
          <View style={styles.alreadyCard}>
            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
            <Text style={styles.alreadyText}>Premium üyeliğin aktif. İyi antrenmanlar!</Text>
          </View>
        )}

        {/* Benefit cards */}
        <View style={styles.featuresList}>
          {PREMIUM_BENEFITS.map((f) => (
            <View key={f.label} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={22} color={colors.gold} />
              </View>
              <View style={styles.featureInfo}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Plans */}
        {!isPremium && (
          <>
            <Text style={styles.plansTitle}>Plan Seç</Text>
            <View style={styles.plansRow}>
              {PLANS.map((plan) => {
                const selected = selectedPlan === plan.id;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[styles.planCard, selected && styles.planCardSelected]}
                    onPress={() => setSelectedPlan(plan.id)}
                    activeOpacity={0.85}
                  >
                    {plan.popular && (
                      <View style={styles.planBadge}>
                        <Text style={styles.planBadgeText}>{plan.badge}</Text>
                      </View>
                    )}
                    <Text style={styles.planLabel}>{plan.label}</Text>
                    <Text style={[styles.planPrice, selected && styles.planPriceSelected]}>
                      {plan.price}
                    </Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={handlePurchase}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Premium üyeliği başlat"
            >
              <Ionicons name="star" size={18} color={colors.background} />
              <Text style={styles.ctaLabel}>
                {purchasing ? 'İŞLENİYOR...' : "PREMIUM'U BAŞLAT"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              İstediğin zaman iptal edebilirsin. Önce değer gör, sonra karar ver.
            </Text>
          </>
        )}
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
    fontSize: 38,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 44,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: spacing.md,
  },
  alreadyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(76,175,80,0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.3)',
  },
  alreadyText: { ...typography.bodyMedium, color: colors.text, flex: 1 },
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
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingTop: spacing.xl,
    ...shadows.sm,
  },
  planCardSelected: {
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
  planPriceSelected: { color: colors.gold },
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
