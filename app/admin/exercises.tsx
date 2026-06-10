import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { DataTable, TableColumn } from '@/src/components/admin/DataTable';
import { AdminButton, AdminCard, PageHeader, StatusBadge } from '@/src/components/admin/ui';
import {
  ENVIRONMENT_LABELS,
  EQUIPMENT_LABELS,
  MUSCLE_LABELS,
} from '@/src/constants/strings';
import { EXERCISES_WITH_MEDIA } from '@/src/data/adminMock';
import { exercises } from '@/src/data/exercises';
import { notify } from '@/src/utils/notify';
import { borderRadius, colors, spacing, typography } from '@/src/theme';
import { Exercise } from '@/src/types';

function hasMedia(e: Exercise): boolean {
  return EXERCISES_WITH_MEDIA.has(e.id) || !!e.videoUrl || !!e.gifUrl || !!e.imageUrl;
}

const COLUMNS: TableColumn<Exercise>[] = [
  { key: 'name',   title: 'Hareket Adı', width: 190, flex: 2, value: (e) => e.name },
  { key: 'muscle', title: 'Kas Grubu',   width: 110, value: (e) => MUSCLE_LABELS[e.muscleGroup] },
  { key: 'env',    title: 'Ortam',       width: 170, value: (e) => e.environments.map((env) => ENVIRONMENT_LABELS[env]).join(' · ') },
  { key: 'equip',  title: 'Ekipman',     width: 120, value: (e) => EQUIPMENT_LABELS[e.equipment] },
  {
    key: 'media', title: 'Medya Durumu', width: 130,
    render: (e) => (
      <StatusBadge
        label={hasMedia(e) ? 'Yüklendi' : 'Bekliyor'}
        tone={hasMedia(e) ? 'success' : 'warning'}
      />
    ),
  },
  {
    key: 'actions', title: 'İşlemler', width: 230,
    render: (e) => (
      <View style={styles.actionsCell}>
        <AdminButton
          label="Video/GIF Yükle"
          size="sm"
          variant="outline"
          icon="cloud-upload-outline"
          onPress={() => notify('Medya Yükle', `"${e.name}" için medya yükleme backend ile birlikte gelecek.`)}
        />
        <AdminButton
          label="Düzenle"
          size="sm"
          variant="ghost"
          icon="create-outline"
          onPress={() => notify('Egzersiz Düzenle', `"${e.name}" düzenleme formu backend ile birlikte gelecek.`)}
        />
      </View>
    ),
  },
];

export default function AdminExercisesScreen() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return exercises;
    const q = search.toLowerCase();
    return exercises.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (MUSCLE_LABELS[e.muscleGroup] ?? '').toLowerCase().includes(q),
    );
  }, [search]);

  const mediaCount = exercises.filter(hasMedia).length;

  return (
    <>
      <PageHeader
        title="Egzersiz Yönetimi"
        subtitle={`${exercises.length} hareket · ${mediaCount} medyalı, ${exercises.length - mediaCount} medya bekliyor`}
        actions={
          <AdminButton
            label="Yeni Egzersiz Ekle"
            icon="add-circle-outline"
            variant="primary"
            onPress={() => notify('Yeni Egzersiz', 'Egzersiz ekleme formu backend ile birlikte gelecek.')}
          />
        }
      />

      <AdminCard>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Hareket veya kas grubu ara..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            selectionColor={colors.accent}
          />
        </View>

        <DataTable
          columns={COLUMNS}
          data={filtered}
          keyExtractor={(e) => e.id}
          emptyText="Aramanla eşleşen egzersiz bulunamadı."
        />

        <Text style={styles.footNote}>
          Egzersizler uygulamadaki gerçek katalogdan geliyor · Medya durumu mock
        </Text>
      </AdminCard>
    </>
  );
}

const styles = StyleSheet.create({
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
  actionsCell: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  footNote: { ...typography.caption, color: colors.textMuted },
});
