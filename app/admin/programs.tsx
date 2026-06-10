import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DataTable, TableColumn } from '@/src/components/admin/DataTable';
import { AdminButton, AdminCard, PageHeader, StatusBadge } from '@/src/components/admin/ui';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/src/constants/strings';
import { PROGRAM_STATUS } from '@/src/data/adminMock';
import { programs } from '@/src/data/programs';
import { notify } from '@/src/utils/notify';
import { spacing, colors, typography } from '@/src/theme';
import { Program } from '@/src/types';

function statusOf(p: Program): 'published' | 'draft' {
  return PROGRAM_STATUS[p.id] ?? 'published';
}

const COLUMNS: TableColumn<Program>[] = [
  { key: 'title',  title: 'Program Adı', width: 200, flex: 2, value: (p) => p.title },
  { key: 'goal',   title: 'Hedef',       width: 120, value: (p) => CATEGORY_LABELS[p.category] ?? p.category },
  { key: 'level',  title: 'Seviye',      width: 110, value: (p) => DIFFICULTY_LABELS[p.level] },
  { key: 'weeks',  title: 'Süre',        width: 100, value: (p) => `${p.durationWeeks} hafta` },
  {
    key: 'status', title: 'Yayın Durumu', width: 130,
    render: (p) => (
      <StatusBadge
        label={statusOf(p) === 'published' ? 'Yayında' : 'Taslak'}
        tone={statusOf(p) === 'published' ? 'success' : 'warning'}
      />
    ),
  },
  {
    key: 'actions', title: 'İşlemler', width: 210,
    render: (p) => (
      <View style={styles.actionsCell}>
        <AdminButton
          label="Düzenle"
          size="sm"
          variant="ghost"
          icon="create-outline"
          onPress={() => notify('Program Düzenle', `"${p.title}" düzenleme ekranı backend ile birlikte gelecek.`)}
        />
        <AdminButton
          label={statusOf(p) === 'published' ? 'Yayından Kaldır' : 'Yayınla'}
          size="sm"
          variant={statusOf(p) === 'published' ? 'danger' : 'outline'}
          onPress={() =>
            notify(
              statusOf(p) === 'published' ? 'Yayından Kaldır' : 'Yayınla',
              `"${p.title}" için yayın akışı backend ile birlikte aktifleşecek.`,
            )
          }
        />
      </View>
    ),
  },
];

export default function AdminProgramsScreen() {
  const publishedCount = programs.filter((p) => statusOf(p) === 'published').length;

  return (
    <>
      <PageHeader
        title="Program Yönetimi"
        subtitle={`${programs.length} program · ${publishedCount} yayında, ${programs.length - publishedCount} taslak`}
        actions={
          <AdminButton
            label="Yeni Program Oluştur"
            icon="add-circle-outline"
            variant="primary"
            onPress={() => notify('Yeni Program', 'Program oluşturma sihirbazı backend ile birlikte gelecek.')}
          />
        }
      />

      <AdminCard>
        <DataTable columns={COLUMNS} data={programs} keyExtractor={(p) => p.id} />
        <Text style={styles.footNote}>
          Program içerikleri uygulamadaki gerçek katalogdan geliyor · Yayın durumu mock
        </Text>
      </AdminCard>
    </>
  );
}

const styles = StyleSheet.create({
  actionsCell: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  footNote: { ...typography.caption, color: colors.textMuted },
});
