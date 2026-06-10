import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AdminModal } from '@/src/components/admin/AdminModal';
import { DataTable, TableColumn } from '@/src/components/admin/DataTable';
import { ChipSelect } from '@/src/components/admin/forms';
import { AdminButton, AdminCard, PageHeader, StatusBadge } from '@/src/components/admin/ui';
import {
  GENDER_LABELS,
  GOAL_LABELS,
  LOCATION_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  TIER_LABELS,
} from '@/src/constants/strings';
import { getWorkoutById } from '@/src/data/workouts';
import { getLatestSubscription, getUserTier, useAppState } from '@/src/services/appStore';
import { getDataSource, SUBSCRIPTION_PLANS } from '@/src/services/dataSource';
import { borderRadius, colors, spacing, typography } from '@/src/theme';
import { AdminUserTier, SubscriptionPlanId, UserAccount } from '@/src/types/admin';
import { formatRelativeTime, formatShortDate } from '@/src/utils/formatters';
import { confirmAction, notify } from '@/src/utils/notify';

const TIER_TONES: Record<AdminUserTier, 'muted' | 'gold' | 'warning'> = {
  free: 'muted',
  premium: 'gold',
  expired: 'warning',
};

type TierFilter = 'all' | AdminUserTier;

const TIER_FILTERS: { key: TierFilter; label: string }[] = [
  { key: 'all',     label: 'Tümü' },
  { key: 'premium', label: 'Premium' },
  { key: 'free',    label: 'Ücretsiz' },
  { key: 'expired', label: 'Süresi Dolmuş' },
];

export default function AdminUsersScreen() {
  const users         = useAppState((s) => s.users);
  const subscriptions = useAppState((s) => s.subscriptions);
  const programs      = useAppState((s) => s.programs);

  const [search, setSearch]             = useState('');
  const [tierFilter, setTierFilter]     = useState<TierFilter>('all');
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [planId, setPlanId]             = useState<SubscriptionPlanId>('monthly');
  const [assignTarget, setAssignTarget] = useState<string>('');

  const selected = users.find((u) => u.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    let list = users;
    if (tierFilter !== 'all') {
      list = list.filter((u) => getUserTier(u, subscriptions) === tierFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.profile.name.toLowerCase().includes(q) ||
          (u.email ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [users, subscriptions, search, tierFilter]);

  // Yayında ve premium olarak işaretli programlar atanabilir
  const assignablePrograms = useMemo(
    () => programs.filter((m) => m.meta.status === 'published'),
    [programs],
  );

  const columns: TableColumn<UserAccount>[] = useMemo(
    () => [
      {
        key: 'name', title: 'Ad Soyad', width: 180, flex: 2,
        render: (u) => (
          <View style={styles.nameCell}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{u.profile.name.charAt(0)}</Text>
            </View>
            <View style={styles.nameInfo}>
              <Text style={styles.userName} numberOfLines={1}>{u.profile.name}</Text>
              {u.isDevice && <Text style={styles.deviceTag}>Bu cihaz</Text>}
            </View>
          </View>
        ),
      },
      { key: 'email', title: 'E-posta', width: 210, flex: 2, value: (u) => u.email ?? '—' },
      {
        key: 'tier', title: 'Üyelik Tipi', width: 140,
        render: (u) => {
          const tier = getUserTier(u, subscriptions);
          return <StatusBadge label={TIER_LABELS[tier]} tone={TIER_TONES[tier]} />;
        },
      },
      { key: 'goal',     title: 'Hedef',      width: 120, value: (u) => GOAL_LABELS[u.profile.goal] },
      { key: 'workouts', title: 'Antrenman',  width: 100, value: (u) => `${u.stats?.totalWorkouts ?? 0}` },
      { key: 'active',   title: 'Son Aktif',  width: 110, value: (u) => formatRelativeTime(u.lastActiveAt) },
      {
        key: 'actions', title: 'İşlemler', width: 110,
        render: (u) => (
          <AdminButton
            label="Detay"
            size="sm"
            variant="ghost"
            icon="open-outline"
            onPress={() => {
              setSelectedId(u.id);
              setAssignTarget('');
            }}
          />
        ),
      },
    ],
    [subscriptions],
  );

  // ── Aksiyonlar ────────────────────────────────────────────────────────────
  const ds = getDataSource();

  const handleGrantPremium = async (user: UserAccount) => {
    await ds.users.grantPremium(user.id, planId);
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    notify('Premium Tanımlandı', `${user.profile.name} artık premium üye (${plan?.label} plan).`);
  };

  const handleCancelPremium = async (user: UserAccount) => {
    const ok = await confirmAction(
      'Premium İptali',
      `${user.profile.name} kullanıcısının premium üyeliği iptal edilecek. Emin misin?`,
    );
    if (!ok) return;
    await ds.users.cancelPremium(user.id);
    notify('Premium İptal Edildi', `${user.profile.name} ücretsiz üyeliğe geçirildi.`);
  };

  const handleAssignProgram = async (user: UserAccount) => {
    if (!assignTarget) {
      notify('Program Seç', 'Önce atanacak programı seçmelisin.');
      return;
    }
    await ds.users.assignProgram(user.id, assignTarget);
    const program = programs.find((m) => m.program.id === assignTarget)?.program;
    setAssignTarget('');
    notify('Program Atandı', `"${program?.title}" → ${user.profile.name}`);
  };

  const selectedTier = selected ? getUserTier(selected, subscriptions) : 'free';
  const selectedSub  = selected ? getLatestSubscription(selected.id, subscriptions) : undefined;

  return (
    <>
      <PageHeader
        title="Kullanıcılar"
        subtitle={`${users.length} kayıtlı kullanıcı`}
      />

      <AdminCard>
        {/* Toolbar */}
        <View style={styles.toolbar}>
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={16} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="İsim veya e-posta ara..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              selectionColor={colors.accent}
            />
          </View>
          <View style={styles.filterRow}>
            {TIER_FILTERS.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, tierFilter === f.key && styles.filterChipActive]}
                onPress={() => setTierFilter(f.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterLabel, tierFilter === f.key && styles.filterLabelActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={(u) => u.id}
          emptyText="Aramanla eşleşen kullanıcı bulunamadı."
        />

        <Text style={styles.footNote}>{filtered.length} kullanıcı gösteriliyor</Text>
      </AdminCard>

      {/* ── Kullanıcı detay modalı ── */}
      {selected && (
        <AdminModal
          visible
          title={selected.profile.name}
          subtitle={selected.email ?? 'E-posta kaydı yok'}
          onClose={() => setSelectedId(null)}
        >
          {/* Üyelik durumu */}
          <View style={styles.modalSection}>
            <Text style={styles.sectionLabel}>ÜYELİK</Text>
            <View style={styles.badgeRow}>
              <StatusBadge label={TIER_LABELS[selectedTier]} tone={TIER_TONES[selectedTier]} />
              {selectedSub && (
                <Text style={styles.subInfo}>
                  {SUBSCRIPTION_PLANS.find((p) => p.id === selectedSub.planId)?.label} plan ·{' '}
                  {formatShortDate(selectedSub.startedAt)} → {formatShortDate(selectedSub.expiresAt)} ·{' '}
                  {SUBSCRIPTION_STATUS_LABELS[selectedSub.status]}
                </Text>
              )}
            </View>

            {selected.membership === 'premium' ? (
              <AdminButton
                label="Premium Üyeliği İptal Et"
                icon="close-circle-outline"
                variant="danger"
                size="sm"
                onPress={() => handleCancelPremium(selected)}
              />
            ) : (
              <View style={styles.grantRow}>
                <ChipSelect
                  options={SUBSCRIPTION_PLANS.map((p) => ({ key: p.id, label: p.label }))}
                  value={planId}
                  onChange={setPlanId}
                />
                <AdminButton
                  label="Premium Yap"
                  icon="star-outline"
                  variant="primary"
                  size="sm"
                  onPress={() => handleGrantPremium(selected)}
                />
              </View>
            )}
          </View>

          {/* Profil */}
          <View style={styles.modalSection}>
            <Text style={styles.sectionLabel}>PROFİL</Text>
            <View style={styles.infoGrid}>
              <InfoItem label="Yaş"     value={`${selected.profile.age}`} />
              <InfoItem label="Boy"     value={`${selected.profile.height} cm`} />
              <InfoItem label="Kilo"    value={`${selected.profile.weight} kg`} />
              <InfoItem label="Cinsiyet" value={GENDER_LABELS[selected.profile.gender]} />
              <InfoItem label="Hedef"   value={GOAL_LABELS[selected.profile.goal]} />
              <InfoItem label="Antrenman Yeri" value={LOCATION_LABELS[selected.profile.trainingLocation]} />
              <InfoItem label="Kayıt"   value={formatShortDate(selected.createdAt)} />
              <InfoItem label="Son Aktif" value={formatRelativeTime(selected.lastActiveAt)} />
            </View>
          </View>

          {/* Aktivite */}
          <View style={styles.modalSection}>
            <Text style={styles.sectionLabel}>AKTİVİTE</Text>
            <View style={styles.infoGrid}>
              <InfoItem label="Toplam Antrenman" value={`${selected.stats?.totalWorkouts ?? 0}`} />
              <InfoItem label="Seri"             value={`${selected.stats?.currentStreak ?? 0} gün`} />
              <InfoItem label="Bu Hafta"         value={`${selected.stats?.weeklyWorkouts ?? 0}`} />
              <InfoItem label="Favori"           value={`${selected.stats?.favoriteCount ?? 0}`} />
            </View>
            {(selected.stats?.recentWorkouts.length ?? 0) > 0 && (
              <View style={styles.recentList}>
                {selected.stats!.recentWorkouts.map((w, i) => (
                  <View key={`${w.date}_${i}`} style={styles.recentRow}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                    <Text style={styles.recentName} numberOfLines={1}>
                      {getWorkoutById(w.workoutId)?.name ?? 'Antrenman'}
                    </Text>
                    <Text style={styles.recentMeta}>
                      {formatShortDate(w.date)} · {Math.round(w.durationSeconds / 60)} dk
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Program atama */}
          <View style={styles.modalSection}>
            <Text style={styles.sectionLabel}>ATANAN PROGRAMLAR</Text>
            {selected.assignedProgramIds.length === 0 ? (
              <Text style={styles.emptyInfo}>Henüz program atanmadı.</Text>
            ) : (
              <View style={styles.assignedList}>
                {selected.assignedProgramIds.map((pid) => {
                  const program = programs.find((m) => m.program.id === pid)?.program;
                  if (!program) return null;
                  return (
                    <View key={pid} style={styles.assignedRow}>
                      <Ionicons name="albums-outline" size={14} color={colors.accent} />
                      <Text style={styles.assignedName} numberOfLines={1}>{program.title}</Text>
                      <TouchableOpacity
                        onPress={() => ds.users.unassignProgram(selected.id, pid)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="trash-outline" size={14} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}

            {selected.membership === 'premium' ? (
              <View style={styles.grantRow}>
                <ChipSelect
                  options={assignablePrograms.map((m) => ({
                    key: m.program.id,
                    label: m.program.title,
                  }))}
                  value={assignTarget}
                  onChange={setAssignTarget}
                />
                <AdminButton
                  label="Program Ata"
                  icon="add-circle-outline"
                  variant="outline"
                  size="sm"
                  onPress={() => handleAssignProgram(selected)}
                />
              </View>
            ) : (
              <Text style={styles.emptyInfo}>
                Program atamak için kullanıcı önce premium yapılmalı.
              </Text>
            )}
          </View>
        </AdminModal>
      )}
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { gap: spacing.sm },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    maxWidth: 420,
  },
  searchInput: { flex: 1, ...typography.bodySmall, color: colors.text, padding: 0 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  filterChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
  filterLabelActive: { color: colors.background },

  nameCell: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: { ...typography.caption, color: colors.accent, fontWeight: '800' },
  nameInfo: { flexShrink: 1 },
  userName: { ...typography.bodySmall, color: colors.text, fontWeight: '600' },
  deviceTag: { ...typography.caption, color: colors.accent },

  footNote: { ...typography.caption, color: colors.textMuted },

  // Modal
  modalSection: { gap: spacing.sm },
  sectionLabel: { ...typography.label, color: colors.textSecondary, letterSpacing: 1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  subInfo: { ...typography.caption, color: colors.textSecondary, flexShrink: 1 },
  grantRow: { gap: spacing.sm },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  infoItem: {
    minWidth: 120,
    flexGrow: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm + 2,
    gap: 2,
  },
  infoLabel: { ...typography.caption, color: colors.textSecondary },
  infoValue: { ...typography.bodySmall, color: colors.text, fontWeight: '700' },

  recentList: { gap: spacing.xs + 2 },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  recentName: { ...typography.bodySmall, color: colors.text, flex: 1 },
  recentMeta: { ...typography.caption, color: colors.textSecondary },

  assignedList: { gap: spacing.xs + 2 },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  assignedName: { ...typography.bodySmall, color: colors.text, flex: 1 },
  emptyInfo: { ...typography.caption, color: colors.textMuted },
});
