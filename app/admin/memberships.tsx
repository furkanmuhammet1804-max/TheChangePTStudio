import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DataTable, TableColumn } from '@/src/components/admin/DataTable';
import { ChipSelect } from '@/src/components/admin/forms';
import { AdminButton, AdminCard, PageHeader, StatCard, StatusBadge } from '@/src/components/admin/ui';
import { SUBSCRIPTION_STATUS_LABELS } from '@/src/constants/strings';
import { useAppState } from '@/src/services/appStore';
import { getDataSource, SUBSCRIPTION_PLANS } from '@/src/services/dataSource';
import { borderRadius, colors, spacing, typography } from '@/src/theme';
import { Subscription, SubscriptionPlanId, SubscriptionStatus } from '@/src/types/admin';
import { formatShortDate } from '@/src/utils/formatters';
import { confirmAction, notify } from '@/src/utils/notify';

const STATUS_TONES: Record<SubscriptionStatus, 'success' | 'warning' | 'danger' | 'muted'> = {
  active: 'success',
  expired: 'warning',
  cancelled: 'danger',
  trial: 'muted',
};

export default function AdminMembershipsScreen() {
  const users         = useAppState((s) => s.users);
  const subscriptions = useAppState((s) => s.subscriptions);

  const [grantUserId, setGrantUserId] = useState<string>('');
  const [grantPlanId, setGrantPlanId] = useState<SubscriptionPlanId>('monthly');

  const userName = (id: string) =>
    users.find((u) => u.id === id)?.profile.name ?? 'Silinmiş kullanıcı';

  const activeSubs  = subscriptions.filter((s) => s.status === 'active');
  const expiredSubs = subscriptions.filter((s) => s.status === 'expired');

  const sortedSubs = useMemo(
    () => [...subscriptions].sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    [subscriptions],
  );

  // Premium tanımlanabilir kullanıcılar (zaten premium olmayanlar)
  const grantableUsers = useMemo(
    () => users.filter((u) => u.membership !== 'premium'),
    [users],
  );

  const ds = getDataSource();

  const handleGrant = async () => {
    if (!grantUserId) {
      notify('Kullanıcı Seç', 'Premium tanımlanacak kullanıcıyı seçmelisin.');
      return;
    }
    await ds.users.grantPremium(grantUserId, grantPlanId);
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === grantPlanId);
    notify('Premium Tanımlandı', `${userName(grantUserId)} → ${plan?.label} plan.`);
    setGrantUserId('');
  };

  const handleCancel = async (sub: Subscription) => {
    const ok = await confirmAction(
      'Üyelik İptali',
      `${userName(sub.userId)} kullanıcısının aboneliği iptal edilecek. Emin misin?`,
    );
    if (!ok) return;
    await ds.users.cancelPremium(sub.userId);
    notify('Üyelik İptal Edildi', `${userName(sub.userId)} ücretsiz üyeliğe geçirildi.`);
  };

  const columns: TableColumn<Subscription>[] = [
    { key: 'user',  title: 'Kullanıcı', width: 170, flex: 2, value: (s) => userName(s.userId) },
    {
      key: 'plan', title: 'Plan', width: 110,
      value: (s) => SUBSCRIPTION_PLANS.find((p) => p.id === s.planId)?.label ?? s.planId,
    },
    { key: 'start', title: 'Başlangıç', width: 110, value: (s) => formatShortDate(s.startedAt) },
    { key: 'end',   title: 'Bitiş',     width: 110, value: (s) => formatShortDate(s.expiresAt) },
    {
      key: 'status', title: 'Durum', width: 130,
      render: (s) => (
        <StatusBadge label={SUBSCRIPTION_STATUS_LABELS[s.status]} tone={STATUS_TONES[s.status]} />
      ),
    },
    {
      key: 'actions', title: 'İşlemler', width: 120,
      render: (s) =>
        s.status === 'active' ? (
          <AdminButton label="İptal Et" size="sm" variant="danger" onPress={() => handleCancel(s)} />
        ) : (
          <Text style={styles.dimmed}>—</Text>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Premium Üyelikler"
        subtitle="Abonelik durumu, planlar ve manuel premium tanımlama"
      />

      {/* İstatistikler */}
      <View style={styles.statsRow}>
        <StatCard icon="star"         label="Aktif Premium"   value={String(activeSubs.length)} tone="gold" />
        <StatCard icon="time"         label="Süresi Dolan"    value={String(expiredSubs.length)} />
        <StatCard icon="close-circle" label="İptal Edilen"    value={String(subscriptions.filter((s) => s.status === 'cancelled').length)} />
        <StatCard icon="people"       label="Toplam Abonelik" value={String(subscriptions.length)} />
      </View>

      {/* Planlar */}
      <AdminCard title="Abonelik Planları" subtitle="Plan bazında aktif üye dağılımı">
        <View style={styles.planList}>
          {SUBSCRIPTION_PLANS.map((plan) => {
            const count = activeSubs.filter((s) => s.planId === plan.id).length;
            return (
              <View key={plan.id} style={styles.planRow}>
                <View style={styles.planIcon}>
                  <Ionicons name="card-outline" size={20} color={colors.accent} />
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.label} Plan</Text>
                  <Text style={styles.planPrice}>
                    ₺{plan.priceTRY.toLocaleString('tr-TR')} /{' '}
                    {plan.periodMonths === 1 ? 'ay' : `${plan.periodMonths} ay`}
                  </Text>
                </View>
                <View style={styles.planStat}>
                  <Text style={styles.planStatValue}>{count}</Text>
                  <Text style={styles.planStatLabel}>aktif üye</Text>
                </View>
              </View>
            );
          })}
        </View>
      </AdminCard>

      {/* Manuel premium tanımlama */}
      <AdminCard
        title="Manuel Premium Tanımla"
        subtitle="Seçilen kullanıcıya plan süresi kadar premium üyelik verilir"
      >
        {grantableUsers.length === 0 ? (
          <Text style={styles.emptyText}>
            {users.length === 0
              ? 'Kayıtlı kullanıcı bulunamadı. Kullanıcılar uygulamada profil oluşturduğunda burada listelenir.'
              : 'Tüm kayıtlı kullanıcılar zaten premium.'}
          </Text>
        ) : (
          <>
            <ChipSelect
              label="Kullanıcı"
              options={grantableUsers.map((u) => ({ key: u.id, label: u.profile.name }))}
              value={grantUserId}
              onChange={setGrantUserId}
            />
            <ChipSelect
              label="Plan"
              options={SUBSCRIPTION_PLANS.map((p) => ({ key: p.id, label: p.label }))}
              value={grantPlanId}
              onChange={setGrantPlanId}
            />
            <AdminButton label="Premium Tanımla" icon="star-outline" variant="primary" onPress={handleGrant} />
          </>
        )}
      </AdminCard>

      {/* Abonelik geçmişi */}
      <AdminCard title="Abonelikler" subtitle="Başlangıç ve bitiş tarihleriyle tüm üyelik kayıtları">
        <DataTable
          columns={columns}
          data={sortedSubs}
          keyExtractor={(s) => s.id}
          emptyText="Henüz abonelik kaydı yok."
        />
      </AdminCard>

      {/* Ödeme uyarısı */}
      <AdminCard>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={colors.warning} />
          <Text style={styles.infoText}>
            Üyelikler bu panelden manuel yönetilir ve uygulamada anında geçerli olur. Mağaza içi
            otomatik tahsilat, App Store / Google Play geliştirici hesapları ve RevenueCat ürün
            tanımları yapıldığında devreye alınacak; servis katmanı hazır.
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
  planIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planInfo: { flex: 1, minWidth: 140, gap: 2 },
  planName: { ...typography.bodyMedium, color: colors.text, fontWeight: '700' },
  planPrice: { ...typography.bodySmall, color: colors.textSecondary },
  planStat: { alignItems: 'center', minWidth: 80 },
  planStatValue: { ...typography.h4, color: colors.text },
  planStatLabel: { ...typography.caption, color: colors.textSecondary },
  dimmed: { ...typography.bodySmall, color: colors.textMuted },
  emptyText: { ...typography.bodySmall, color: colors.textMuted, lineHeight: 18 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: { ...typography.caption, color: colors.textSecondary, flex: 1, lineHeight: 16 },
});
