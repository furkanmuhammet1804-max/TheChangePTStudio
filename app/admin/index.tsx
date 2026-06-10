import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DataTable, TableColumn } from '@/src/components/admin/DataTable';
import { AdminButton, AdminCard, PageHeader, StatCard, StatusBadge } from '@/src/components/admin/ui';
import { GOAL_LABELS } from '@/src/constants/strings';
import { AdminUserRow, DASHBOARD_STATS, MOCK_USERS, TIER_LABELS } from '@/src/data/adminMock';
import { colors, spacing, typography } from '@/src/theme';

const TIER_TONES = { free: 'muted', premium: 'gold', expired: 'warning' } as const;

const RECENT_COLUMNS: TableColumn<AdminUserRow>[] = [
  { key: 'name',  title: 'Ad Soyad', width: 150, flex: 2, value: (u) => u.name },
  { key: 'tier',  title: 'Üyelik',   width: 130, render: (u) => <StatusBadge label={TIER_LABELS[u.tier]} tone={TIER_TONES[u.tier]} /> },
  { key: 'goal',  title: 'Hedef',    width: 130, value: (u) => GOAL_LABELS[u.goal] },
  { key: 'login', title: 'Son Giriş', width: 110, value: (u) => u.lastLogin },
];

export default function AdminDashboardScreen() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="The Change PT Studio genel görünüm"
      />

      {/* Stat cards */}
      <View style={styles.statsRow}>
        <StatCard icon="people"        label="Toplam Kullanıcı" value={DASHBOARD_STATS.totalUsers}     trend={DASHBOARD_STATS.trends.totalUsers} />
        <StatCard icon="star"          label="Premium Üye"      value={DASHBOARD_STATS.premiumUsers}   trend={DASHBOARD_STATS.trends.premiumUsers} tone="gold" />
        <StatCard icon="albums"        label="Aktif Program"    value={DASHBOARD_STATS.activePrograms} trend={DASHBOARD_STATS.trends.activePrograms} />
        <StatCard icon="cash"          label="Aylık Gelir"      value={DASHBOARD_STATS.monthlyRevenue} trend={DASHBOARD_STATS.trends.monthlyRevenue} tone="gold" />
      </View>

      {/* Two-column area */}
      <View style={styles.columns}>
        <AdminCard
          title="Son Aktif Kullanıcılar"
          subtitle="Bugün giriş yapan ve son kayıt olan üyeler"
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
          <DataTable
            columns={RECENT_COLUMNS}
            data={MOCK_USERS.slice(0, 5)}
            keyExtractor={(u) => u.id}
          />
        </AdminCard>

        <AdminCard title="Hızlı İşlemler" subtitle="Sık kullanılan yönetim aksiyonları" style={styles.quickCard}>
          <View style={styles.quickList}>
            <AdminButton label="Yeni Program Oluştur" icon="add-circle-outline"     variant="primary" onPress={() => router.push('/admin/programs')} />
            <AdminButton label="Yeni Egzersiz Ekle"   icon="barbell-outline"        variant="outline" onPress={() => router.push('/admin/exercises')} />
            <AdminButton label="Bildirim Gönder"      icon="notifications-outline"  variant="outline" onPress={() => router.push('/admin/notifications')} />
            <AdminButton label="Üyelikleri Yönet"     icon="star-outline"           variant="ghost"   onPress={() => router.push('/admin/memberships')} />
          </View>

          <View style={styles.systemBox}>
            <Text style={styles.systemTitle}>Sistem Durumu</Text>
            <SystemRow label="Uygulama"        value="Çalışıyor" ok />
            <SystemRow label="İçerik Kataloğu" value="34 egzersiz · 5 program" ok />
            <SystemRow label="Ödeme Sistemi"   value="Kurulum bekliyor" />
            <SystemRow label="Push Bildirim"   value="Kurulum bekliyor" />
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
  tableCard: { flex: 2, minWidth: 320 },
  quickCard: { flex: 1, minWidth: 260 },
  quickList: { gap: spacing.sm },
  systemBox: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  systemTitle: { ...typography.label, color: colors.textSecondary, letterSpacing: 1, textTransform: 'uppercase' },
  systemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  systemDot: { width: 7, height: 7, borderRadius: 4 },
  systemLabel: { ...typography.bodySmall, color: colors.text, flex: 1 },
  systemValue: { ...typography.caption, color: colors.textSecondary },
});
