import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AdminModal } from '@/src/components/admin/AdminModal';
import { DataTable, TableColumn } from '@/src/components/admin/DataTable';
import { ChipSelect, FormField, MultiChipSelect } from '@/src/components/admin/forms';
import { MediaSlotPicker } from '@/src/components/admin/MediaPicker';
import { AdminButton, AdminCard, PageHeader, StatusBadge } from '@/src/components/admin/ui';
import {
  DIFFICULTY_LABELS,
  ENVIRONMENT_LABELS,
  EQUIPMENT_LABELS,
  MEDIA_STATUS_LABELS,
  MUSCLE_LABELS,
} from '@/src/constants/strings';
import { getMediaStatus } from '@/src/lib/media';
import { useAppState } from '@/src/services/appStore';
import { getDataSource } from '@/src/services/dataSource';
import { MediaSlot, PickedMedia } from '@/src/services/mediaUploadService';
import { borderRadius, colors, spacing, typography } from '@/src/theme';
import { Difficulty, Environment, Equipment, Exercise, MuscleGroup } from '@/src/types';
import { confirmAction, notify } from '@/src/utils/notify';

const MUSCLE_OPTIONS = (
  ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'glutes', 'core', 'cardio', 'mobility', 'full_body'] as MuscleGroup[]
).map((key) => ({ key, label: MUSCLE_LABELS[key] }));

const ENV_OPTIONS = (['home', 'gym', 'outdoor', 'travel'] as Environment[]).map((key) => ({
  key,
  label: ENVIRONMENT_LABELS[key],
}));

const EQUIPMENT_OPTIONS = (
  ['none', 'dumbbells', 'barbell', 'kettlebell', 'machine', 'cables', 'resistance_bands', 'trx', 'pull_up_bar'] as Equipment[]
).map((key) => ({ key, label: EQUIPMENT_LABELS[key] }));

const LEVEL_OPTIONS = (['beginner', 'intermediate', 'advanced'] as Difficulty[]).map((key) => ({
  key,
  label: DIFFICULTY_LABELS[key],
}));

function hasMedia(e: Exercise): boolean {
  return getMediaStatus(e) !== 'missing';
}

interface FormState {
  name: string;
  description: string;
  muscleGroup: MuscleGroup;
  difficulty: Difficulty;
  equipment: Equipment;
  environments: Environment[];
  howTo: string;
  videoUrl: string;
  gifUrl: string;
  imageUrl: string;
  thumbnailUrl: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  muscleGroup: 'chest',
  difficulty: 'beginner',
  equipment: 'none',
  environments: ['home'],
  howTo: '',
  videoUrl: '',
  gifUrl: '',
  imageUrl: '',
  thumbnailUrl: '',
};

/** Medya slotu → form alanı eşlemesi */
const SLOT_FIELDS: { slot: MediaSlot; field: 'imageUrl' | 'gifUrl' | 'videoUrl' | 'thumbnailUrl'; urlLabel: string }[] = [
  { slot: 'image',     field: 'imageUrl',     urlLabel: 'Görsel URL' },
  { slot: 'gif',       field: 'gifUrl',       urlLabel: 'GIF URL' },
  { slot: 'video',     field: 'videoUrl',     urlLabel: 'Video URL' },
  { slot: 'thumbnail', field: 'thumbnailUrl', urlLabel: 'Thumbnail URL' },
];

type MediaMode = 'file' | 'url';

export default function AdminExercisesScreen() {
  const exercises = useAppState((s) => s.exercises);

  const [search, setSearch]               = useState('');
  const [muscleFilter, setMuscleFilter]   = useState<'all' | MuscleGroup>('all');
  const [envFilter, setEnvFilter]         = useState<'all' | Environment>('all');
  const [equipFilter, setEquipFilter]     = useState<'all' | Equipment>('all');
  const [levelFilter, setLevelFilter]     = useState<'all' | Difficulty>('all');
  const [modalOpen, setModalOpen]         = useState(false);
  const [editingId, setEditingId]         = useState<string | null>(null);
  const [form, setForm]                   = useState<FormState>(EMPTY_FORM);
  const [mediaMode, setMediaMode]         = useState<MediaMode>('file');
  const [pickedMeta, setPickedMeta]       = useState<Partial<Record<MediaSlot, PickedMedia>>>({});

  const ds = getDataSource();

  const filtered = useMemo(() => {
    let list = exercises;
    if (muscleFilter !== 'all') list = list.filter((e) => e.muscleGroup === muscleFilter);
    if (envFilter !== 'all')    list = list.filter((e) => e.environments.includes(envFilter));
    if (equipFilter !== 'all')  list = list.filter((e) => e.equipment === equipFilter);
    if (levelFilter !== 'all')  list = list.filter((e) => e.difficulty === levelFilter || e.difficulty === 'all');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (MUSCLE_LABELS[e.muscleGroup] ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [exercises, search, muscleFilter, envFilter, equipFilter, levelFilter]);

  const mediaCount = exercises.filter(hasMedia).length;

  // ── Modal ─────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMediaMode('file');
    setPickedMeta({});
    setModalOpen(true);
  };

  const openEdit = (e: Exercise) => {
    setEditingId(e.id);
    setForm({
      name: e.name,
      description: e.description,
      muscleGroup: e.muscleGroup,
      difficulty: e.difficulty === 'all' ? 'beginner' : e.difficulty,
      equipment: e.equipment,
      environments: e.environments,
      howTo: e.howTo.join('\n'),
      videoUrl: e.videoUrl ?? '',
      gifUrl: e.gifUrl ?? '',
      imageUrl: e.imageUrl ?? '',
      thumbnailUrl: e.thumbnailUrl ?? '',
    });
    setMediaMode('file');
    setPickedMeta({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      notify('Eksik Bilgi', 'Hareket adı ve açıklaması zorunludur.');
      return;
    }
    if (form.environments.length === 0) {
      notify('Eksik Bilgi', 'En az bir ortam seçmelisin.');
      return;
    }
    const base = {
      name: form.name.trim(),
      description: form.description.trim(),
      muscleGroup: form.muscleGroup,
      difficulty: form.difficulty,
      equipment: form.equipment,
      environments: form.environments,
      howTo: form.howTo.split('\n').map((s) => s.trim()).filter(Boolean),
      videoUrl: form.videoUrl.trim() || undefined,
      gifUrl: form.gifUrl.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      thumbnailUrl: form.thumbnailUrl.trim() || undefined,
    };

    if (editingId) {
      await ds.exercises.updateExercise(editingId, base);
      notify('Egzersiz Güncellendi', `"${base.name}" kaydedildi.`);
    } else {
      await ds.exercises.createExercise({
        ...base,
        tips: [],
        commonMistakes: [],
        alternatives: [],
      });
      notify('Egzersiz Eklendi', `"${base.name}" mobil kütüphanede artık görünür.`);
    }
    setModalOpen(false);
  };

  const handleDelete = async (e: Exercise) => {
    const ok = await confirmAction(
      'Egzersizi Sil',
      `"${e.name}" kütüphaneden kaldırılacak. Emin misin?`,
    );
    if (!ok) return;
    await ds.exercises.deleteExercise(e.id);
    notify('Egzersiz Silindi', `"${e.name}" kaldırıldı.`);
  };

  // ── Tablo ─────────────────────────────────────────────────────────────────
  const columns: TableColumn<Exercise>[] = [
    { key: 'name',   title: 'Hareket Adı', width: 180, flex: 2, value: (e) => e.name },
    { key: 'muscle', title: 'Kas Grubu',   width: 100, value: (e) => MUSCLE_LABELS[e.muscleGroup] },
    { key: 'env',    title: 'Ortam',       width: 150, value: (e) => e.environments.map((env) => ENVIRONMENT_LABELS[env]).join(' · ') },
    { key: 'equip',  title: 'Ekipman',     width: 110, value: (e) => EQUIPMENT_LABELS[e.equipment] },
    {
      key: 'media', title: 'Medya', width: 120,
      render: (e) => {
        const status = getMediaStatus(e);
        return (
          <StatusBadge
            label={MEDIA_STATUS_LABELS[status]}
            tone={status === 'missing' ? 'warning' : 'success'}
          />
        );
      },
    },
    {
      key: 'actions', title: 'İşlemler', width: 190,
      render: (e) => (
        <View style={styles.actionsCell}>
          <AdminButton label="Düzenle" size="sm" variant="ghost" icon="create-outline" onPress={() => openEdit(e)} />
          <AdminButton label="Sil" size="sm" variant="danger" icon="trash-outline" onPress={() => handleDelete(e)} />
        </View>
      ),
    },
  ];

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
            onPress={openCreate}
          />
        }
      />

      <AdminCard>
        {/* Arama + filtreler */}
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

        <ChipSelect
          label="Kas Grubu"
          options={[{ key: 'all' as const, label: 'Tümü' }, ...MUSCLE_OPTIONS]}
          value={muscleFilter}
          onChange={setMuscleFilter}
        />
        <ChipSelect
          label="Ortam"
          options={[{ key: 'all' as const, label: 'Tümü' }, ...ENV_OPTIONS]}
          value={envFilter}
          onChange={setEnvFilter}
        />
        <ChipSelect
          label="Ekipman"
          options={[{ key: 'all' as const, label: 'Tümü' }, ...EQUIPMENT_OPTIONS]}
          value={equipFilter}
          onChange={setEquipFilter}
        />
        <ChipSelect
          label="Zorluk"
          options={[{ key: 'all' as const, label: 'Tümü' }, ...LEVEL_OPTIONS]}
          value={levelFilter}
          onChange={setLevelFilter}
        />

        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={(e) => e.id}
          emptyText="Filtrelerle eşleşen egzersiz bulunamadı."
        />

        <Text style={styles.footNote}>
          {filtered.length} hareket gösteriliyor · Egzersiz kütüphanesi tüm üyelere açıktır
        </Text>
      </AdminCard>

      {/* ── Ekle / düzenle modalı ── */}
      <AdminModal
        visible={modalOpen}
        title={editingId ? 'Egzersizi Düzenle' : 'Yeni Egzersiz'}
        subtitle="Hareket adı İngilizce, açıklamalar Türkçe yazılır (örn: Bench Press)"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <AdminButton label="Vazgeç" variant="ghost" onPress={() => setModalOpen(false)} />
            <AdminButton
              label={editingId ? 'Kaydet' : 'Ekle'}
              icon="checkmark-outline"
              variant="primary"
              onPress={handleSave}
            />
          </>
        }
      >
        <FormField
          label="Hareket Adı (İngilizce)"
          value={form.name}
          onChangeText={(name) => setForm((f) => ({ ...f, name }))}
          placeholder="Örn: Incline Dumbbell Press"
          maxLength={60}
          autoCapitalize="words"
        />
        <FormField
          label="Açıklama (Türkçe)"
          value={form.description}
          onChangeText={(description) => setForm((f) => ({ ...f, description }))}
          placeholder="Hareketin hangi kasları çalıştırdığını ve amacını açıkla..."
          multiline
          maxLength={200}
        />
        <ChipSelect
          label="Kas Grubu"
          options={MUSCLE_OPTIONS}
          value={form.muscleGroup}
          onChange={(muscleGroup) => setForm((f) => ({ ...f, muscleGroup }))}
        />
        <ChipSelect
          label="Zorluk"
          options={LEVEL_OPTIONS}
          value={form.difficulty}
          onChange={(difficulty) => setForm((f) => ({ ...f, difficulty }))}
        />
        <ChipSelect
          label="Ekipman"
          options={EQUIPMENT_OPTIONS}
          value={form.equipment}
          onChange={(equipment) => setForm((f) => ({ ...f, equipment }))}
        />
        <MultiChipSelect
          label="Ortam"
          options={ENV_OPTIONS}
          values={form.environments}
          onChange={(environments) => setForm((f) => ({ ...f, environments }))}
        />
        <FormField
          label="Nasıl Yapılır (her satır bir adım)"
          value={form.howTo}
          onChangeText={(howTo) => setForm((f) => ({ ...f, howTo }))}
          placeholder={'Sırtüstü sehpaya yat.\nBarı omuz genişliğinde tut.\nKontrollü indir, güçlü kaldır.'}
          multiline
        />
        {/* Medya — varsayılan: cihazdan dosya seç; alternatif: URL gir */}
        <View style={styles.mediaSection}>
          <View style={styles.mediaSectionHeader}>
            <Text style={styles.mediaSectionTitle}>MEDYA</Text>
            <StatusBadge
              label={
                MEDIA_STATUS_LABELS[
                  form.videoUrl ? 'video_ready'
                  : form.gifUrl ? 'gif_ready'
                  : form.imageUrl ? 'image_ready'
                  : 'missing'
                ]
              }
              tone={form.videoUrl || form.gifUrl || form.imageUrl ? 'success' : 'warning'}
            />
          </View>

          <ChipSelect<MediaMode>
            options={[
              { key: 'file', label: 'Dosya Seç' },
              { key: 'url',  label: 'URL Gir' },
            ]}
            value={mediaMode}
            onChange={setMediaMode}
          />

          {mediaMode === 'file'
            ? SLOT_FIELDS.map(({ slot, field }) => (
                <MediaSlotPicker
                  key={slot}
                  slot={slot}
                  value={form[field]}
                  meta={pickedMeta[slot]}
                  onChange={(uri, media) => {
                    setForm((f) => ({ ...f, [field]: uri }));
                    setPickedMeta((m) => ({ ...m, [slot]: media }));
                  }}
                />
              ))
            : SLOT_FIELDS.map(({ slot, field, urlLabel }) => (
                <FormField
                  key={slot}
                  label={urlLabel}
                  value={form[field]}
                  onChangeText={(value) => setForm((f) => ({ ...f, [field]: value }))}
                  placeholder="https://..."
                  autoCapitalize="none"
                />
              ))}

          <Text style={styles.mediaHint}>
            Dosyalar şimdilik cihazda yerel olarak saklanır; depolama (storage) bağlandığında
            otomatik buluta yüklenecek.
          </Text>
        </View>
      </AdminModal>
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

  mediaSection: {
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  mediaSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  mediaSectionTitle: { ...typography.label, color: colors.textSecondary, letterSpacing: 1 },
  mediaHint: { ...typography.caption, color: colors.textMuted, lineHeight: 15 },
});
