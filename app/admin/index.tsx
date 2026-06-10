import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DataTable, TableColumn } from '@/src/components/admin/DataTable';
import { AdminButton, AdminCard, PageHeader, StatCard, StatusBadge } from '@/src/components/admin/ui';
import { GOAL_LABELS, TIER_LABELS } from '@/src/constants/strings';
import { computeDashboardStats, getUserTier, useAppState } from '@/src/services/appStore';
import { colors, spacing, typography } from '@/src/theme';
import { AdminUserTier, Subscription, UserAccount } from '@/src/types/admin';
import { formatRelativeTime, formatShortDate } from '@/src/utils/formatters';

const TIER_TONES: Record<AdminUserTier, 'muted' | 'gold' | 'warning'> = {
  free: 'muted',
  premium: 'gold',
  expired: 'warning',
};

function buildColumns(subscriptions: Subscription[], dateColumn: 'createdAt' | 'lastActiveAt'): TableColumn<UserAccount>[] {
  return [
    { key: 'name', title: 'Ad Soyad', width: 150, flex: 2, value: (u) => u.profile.name },
    {
      key: 'tier', title: 'Üyelik', width: 130,
      render: (u) => {
        const tier = getUserTier(u, subscriptions);
        return <StatusBadge label={TIER_LABELS[tier]} tone={TIER_TONES[tier]} />;
      },
    },
    { key: 'goal', title: 'Hedef', width: 130, value: (u) => GOAL_LABELS[u.profile.goal] },
    {
      key: dateColumn,
      title: dateColumn === 'createdAt' ? 'Kayıt' : 'Son Aktif',
      width: 120,
      value: (u) =>
        dateColumn === 'createdAt'
          ? formatShortDate(u.createdAt)
          : formatRelativeTime(u.lastActiveAt),
    },
  ];
}

export default function AdminDashboardScreen() {
  const state = useAppState((s) => s);

  const stats = useMemo(() => computeDashboardStats(state), [state]);

  const recentSignups = useMemo(
    () => [...state.users].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [state.users],
  );
  const recentActive = useMemo(
    () =>
      [...state.users]
        .filter((u) => !!u.lastActiveAt)
        .sort((a, b) => (b.lastActiveAt ?? '').localeCompare(a.lastActiveAt ?? ''))
        .slice(0, 5),
    [state.users],
  );

  const signupColumns = useMemo(
    () => buildColumns(state.subscriptions, 'createdAt'),
    [state.subscriptions],
  );
  const activeColumns = useMemo(
    () => buildColumns(state.subscriptions, 'lastActiveAt'),
    [state.subscriptions],
  );

  return (
    <>
      <PageHeader title="Dashboard" subtitle={`${state.settings.companyName} genel görünüm`} />

      {/* Üyelik istatistikleri */}
      <View style={styles.statsRow}>
        <StatCard icon="people"  label="Toplam Kullanıcı"     value={String(stats.totalUsers)} />
        <StatCard icon="star"    label="Premium Üye"          value={String(stats.premiumUsers)} tone="gold" />
        <StatCard icon="person"  label="Ücretsiz Üye"         value={String(stats.freeUsers)} />
        <StatCard icon="time"    label="Süresi Dolan Üyelik"  value={String(stats.expiredUsers)} />
      </View>

      {/* İçerik istatistikleri */}
      <View style={styles.statsRow}>
        <StatCard icon="albums"           label="Aktif Program"          value={String(stats.publishedPrograms)} trend={`${stats.totalPrograms} toplam`} />
        <StatCard icon="barbell"          label="Egzersiz"               value={String(stats.totalExercises)} />
        <StatCard icon="checkmark-circle" label="Tamamlanan Antrenman"   value={String(stats.workoutsCompletedTotal)} tone="gold" />
      </View>

      {/* Tablolar */}
      <View style={styles.columns}>
        <AdminCard
          title="Son Kayıt Olan Kullanıcılar"
          subtitle="En yeni üyelikler"
          style={styles.tableCard}
          actions={
            <AdminButton
              label="Tümünü Gör"
              variant="ghost"
              size="sm"
              icon="arrow-forward-outline"
              onPress={() => router.push('/admin/users')}
            />
          }
        >
          <DataTable columns={signupColumns} data={recentSignups} keyExtractor={(u) => u.id} />
        </AdminCard>

        <AdminCard
          title="Son Aktif Kullanıcılar"
          subtitle="Uygulamayı en son kullananlar"
          style={styles.tableCard}
        >
          <DataTable columns={activeColumns} data={recentActive} keyExtractor={(u) => u.id} />
        </AdminCard>
      </View>

      {/* Hızlı işlemler + sistem durumu */}
      <View style={styles.columns}>
        <AdminCard title="Hızlı İşlemler" subtitle="Sık kullanılan yönetim aksiyonları" style={styles.quickCard}>
          <View style={styles.quickList}>
            <AdminButton label="Yeni Program Oluştur" icon="add-circle-outline"    variant="primary" onPress={() => router.push('/admin/programs')} />
            <AdminButton label="Yeni Egzersiz Ekle"   icon="barbell-outline"       variant="outline" onPress={() => router.push('/admin/exercises')} />
            <AdminButton label="Bildirim Gönder"      icon="notifications-outline" variant="outline" onPress={() => router.push('/admin/notifications')} />
            <AdminButton label="Üyelikleri Yönet"     icon="star-outline"          variant="ghost"   onPress={() => router.push('/admin/memberships')} />
          </View>
        </AdminCard>

        <AdminCard title="Sistem Durumu" subtitle="Servis ve içerik özeti" style={styles.quickCard}>
          <View style={styles.systemBox}>
            <SystemRow label="Uygulama" value={`v${state.settings.appVersion} · Çalışıyor`} ok />
            <SystemRow
              label="İçerik Kataloğu"
              value={`${stats.totalExercises} egzersiz · ${stats.totalPrograms} program`}
              ok
            />
            <SystemRow
              label="İçerik Senkronu"
              value={
                state.settings.lastContentSyncAt
                  ? `Son değişiklik ${formatRelativeTime(state.settings.lastContentSyncAt)}`
                  : 'Değişiklik yok'
              }
              ok
            />
            <SystemRow
              label="Ödeme Sistemi"
              value={state.settings.paymentsEnabled ? 'Bağlı' : 'Kurulum bekliyor'}
              ok={state.settings.paymentsEnabled}
            />
            <SystemRow
              label="Push Bildirim"
              value={state.settings.pushEnabled ? 'Bağlı' : 'Kurulum bekliyor'}
              ok={state.settings.pushEnabled}
            />
          </View>
        </AdminCard>
      </View>
    </>
  );
}

function SystemRow({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <View style={styles.systemRow}>
      <View style={[styles.systemDot, { backgroundColor: ok ? colors.success : colors.warning }]} />
      <Text style={styles.systemLabel}>{label}</Text>
      <Text style={styles.systemValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignItems: 'flex-start' },
  tableCard: { flex: 1, minWidth: 320 },
  quickCard: { flex: 1, minWidth: 280 },
  quickList: { gap: spacing.sm },
  systemBox: { gap: spacing.sm },
  systemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  systemDot: { width: 7, height: 7, borderRadius: 4 },
  systemLabel: { ...typography.bodySmall, color: colors.text, flex: 1 },
  systemValue: { ...typography.caption, color: colors.textSecondary },
});
