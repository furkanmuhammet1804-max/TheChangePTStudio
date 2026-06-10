import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdminButton, AdminCard, PageHeader, StatCard, StatusBadge } from '@/src/components/admin/ui';
import { MEMBERSHIP_STATS, PLAN_STATS } from '@/src/data/adminMock';
import { SUBSCRIPTION_PLANS } from '@/src/services/dataSource';
import { notify } from '@/src/utils/notify';
import { borderRadius, colors, spacing, typography } from '@/src/theme';

const STAT_ICONS = {
  active: 'star',
  renewed: 'refresh',
  expired: 'time',
  cancelled: 'close-circle',
} as const;

export default function AdminMembershipsScreen() {
  return (
    <>
      <PageHeader
        title="Premium Üyelikler"
        subtitle="Abonelik durumu ve plan performansı (mock veri)"
        actions={
          <AdminButton
            label="Kampanya Oluştur"
            icon="pricetag-outline"
            variant="outline"
            onPress={() => notify('Kampanya', 'İndirim kampanyaları ödeme sistemi ile birlikte gelecek.')}
          />
        }
      />

      {/* Membership stats */}
      <View style={styles.statsRow}>
        {MEMBERSHIP_STATS.map((s) => (
          <StatCard
            key={s.key}
            icon={STAT_ICONS[s.key as keyof typeof STAT_ICONS]}
            label={s.label}
            value={s.value}
            trend={s.trend}
            tone={s.key === 'active' ? 'gold' : 'accent'}
          />
        ))}
      </View>

      {/* Plans */}
      <AdminCard
        title="Abonelik Planları"
        subtitle="Plan bazında üye sayısı ve aylık gelir dağılımı"
      >
        <View style={styles.planList}>
          {SUBSCRIPTION_PLANS.map((plan) => {
            const stats = PLAN_STATS.find((p) => p.planId === plan.id);
            return (
              <View key={plan.id} style={[styles.planRow, stats?.popular && styles.planRowPopular]}>
                <View style={styles.planIcon}>
                  <Ionicons name="card-outline" size={20} color={stats?.popular ? colors.gold : colors.accent} />
                </View>

                <View style={styles.planInfo}>
                  <View style={styles.planTitleRow}>
                    <Text style={styles.planName}>{plan.label} Plan</Text>
                    {stats?.popular && <StatusBadge label="En Popüler" tone="gold" />}
                  </View>
                  <Text style={styles.planPrice}>
                    ₺{plan.priceTRY.toLocaleString('tr-TR')} / {plan.periodMonths === 1 ? 'ay' : `${plan.periodMonths} ay`}
                  </Text>
                </View>

                <View style={styles.planStat}>
                  <Text style={styles.planStatValue}>{stats?.subscribers ?? 0}</Text>
                  <Text style={styles.planStatLabel}>üye</Text>
                </View>

                <View style={styles.planStat}>
                  <Text style={[styles.planStatValue, { color: colors.accent }]}>{stats?.monthlyRevenue ?? '—'}</Text>
                  <Text style={styles.planStatLabel}>aylık gelir</Text>
                </View>

                <AdminButton
                  label="Düzenle"
                  size="sm"
                  variant="ghost"
                  onPress={() => notify('Plan Düzenleme', 'Plan fiyatlandırması backend ile birlikte düzenlenebilecek.')}
                />
              </View>
            );
          })}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={colors.warning} />
          <Text style={styles.infoText}>
            Ödeme sistemi henüz bağlı değil. Planlar ve gelirler mock veridir; gerçek abonelik akışı
            ödeme sağlayıcı (ör. RevenueCat / İyzico) entegrasyonuyla aktifleşecek.
          </Text>
        </View>
      </AdminCard>
    </>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  planList: { gap: spacing.sm },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexWrap: 'wrap',
  },
  planRowPopular: { borderColor: colors.gold },
  planIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planInfo: { flex: 1, minWidth: 140, gap: 2 },
  planTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  planName: { ...typography.bodyMedium, color: colors.text, fontWeight: '700' },
  planPrice: { ...typography.bodySmall, color: colors.textSecondary },
  planStat: { alignItems: 'center', minWidth: 80 },
  planStatValue: { ...typography.h4, color: colors.text },
  planStatLabel: { ...typography.caption, color: colors.textSecondary },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,167,38,0.08)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,167,38,0.25)',
    padding: spacing.md,
  },
  infoText: { ...typography.caption, color: colors.textSecondary, flex: 1, lineHeight: 16 },
});
