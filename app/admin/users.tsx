import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DataTable, TableColumn } from '@/src/components/admin/DataTable';
import { AdminButton, AdminCard, PageHeader, StatusBadge } from '@/src/components/admin/ui';
import { GOAL_LABELS } from '@/src/constants/strings';
import { AdminUserRow, AdminUserTier, MOCK_USERS, TIER_LABELS } from '@/src/data/adminMock';
import { notify } from '@/src/utils/notify';
import { borderRadius, colors, spacing, typography } from '@/src/theme';

const TIER_TONES = { free: 'muted', premium: 'gold', expired: 'warning' } as const;

type TierFilter = 'all' | AdminUserTier;

const TIER_FILTERS: { key: TierFilter; label: string }[] = [
  { key: 'all',     label: 'Tümü' },
  { key: 'premium', label: 'Premium' },
  { key: 'free',    label: 'Ücretsiz' },
  { key: 'expired', label: 'Süresi Dolmuş' },
];

const COLUMNS: TableColumn<AdminUserRow>[] = [
  {
    key: 'name', title: 'Ad Soyad', width: 170, flex: 2,
    render: (u) => (
      <View style={styles.nameCell}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{u.name.charAt(0)}</Text>
        </View>
        <Text style={styles.userName} numberOfLines={1}>{u.name}</Text>
      </View>
    ),
  },
  { key: 'email', title: 'E-posta',   width: 220, flex: 2, value: (u) => u.email },
  { key: 'tier',  title: 'Üyelik Tipi', width: 140, render: (u) => <StatusBadge label={TIER_LABELS[u.tier]} tone={TIER_TONES[u.tier]} /> },
  { key: 'goal',  title: 'Hedef',     width: 130, value: (u) => GOAL_LABELS[u.goal] },
  { key: 'login', title: 'Son Giriş', width: 120, value: (u) => u.lastLogin },
  { key: 'status', title: 'Durum',    width: 100, render: (u) => <StatusBadge label={u.active ? 'Aktif' : 'Pasif'} tone={u.active ? 'success' : 'muted'} /> },
];

export default function AdminUsersScreen() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');

  const filtered = useMemo(() => {
    let list = MOCK_USERS;
    if (tierFilter !== 'all') list = list.filter((u) => u.tier === tierFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    return list;
  }, [search, tierFilter]);

  return (
    <>
      <PageHeader
        title="Kullanıcılar"
        subtitle={`${MOCK_USERS.length} kayıtlı kullanıcı (mock veri)`}
        actions={
          <AdminButton
            label="Dışa Aktar (CSV)"
            icon="download-outline"
            variant="ghost"
            onPress={() => notify('Dışa Aktarma', 'CSV dışa aktarma backend ile birlikte aktifleşecek.')}
          />
        }
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
          columns={COLUMNS}
          data={filtered}
          keyExtractor={(u) => u.id}
          emptyText="Aramanla eşleşen kullanıcı bulunamadı."
        />

        <Text style={styles.footNote}>
          {filtered.length} kullanıcı gösteriliyor · Detay görünümü ve düzenleme backend ile aktifleşecek
        </Text>
      </AdminCard>
    </>
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
  userName: { ...typography.bodySmall, color: colors.text, fontWeight: '600', flexShrink: 1 },

  footNote: { ...typography.caption, color: colors.textMuted },
});
