import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdminModal } from '@/src/components/admin/AdminModal';
import { DataTable, TableColumn } from '@/src/components/admin/DataTable';
import { ChipSelect, FormField, ToggleRow } from '@/src/components/admin/forms';
import { AdminButton, AdminCard, PageHeader, StatusBadge } from '@/src/components/admin/ui';
import {
  CATEGORY_LABELS,
  CONTENT_STATUS_LABELS,
  DIFFICULTY_LABELS,
} from '@/src/constants/strings';
import { ProgramInput, useAppState } from '@/src/services/appStore';
import { getDataSource } from '@/src/services/dataSource';
import { colors, spacing, typography } from '@/src/theme';
import { ManagedProgram } from '@/src/types/admin';
import { Difficulty, ProgramCategory, WeeklyDays } from '@/src/types';
import { confirmAction, notify } from '@/src/utils/notify';

const CATEGORY_OPTIONS = (
  ['fat_burn', 'muscle_gain', 'full_body', 'core', 'home', 'gym', 'beginner'] as ProgramCategory[]
).map((key) => ({ key, label: CATEGORY_LABELS[key] }));

const LEVEL_OPTIONS = (['beginner', 'intermediate', 'advanced'] as Difficulty[]).map((key) => ({
  key,
  label: DIFFICULTY_LABELS[key],
}));

const WEEK_OPTIONS = [4, 6, 8, 12].map((key) => ({ key, label: `${key} hafta` }));
const DAY_OPTIONS = ([2, 3, 4, 5] as WeeklyDays[]).map((key) => ({ key, label: `${key} gün` }));

interface FormState {
  title: string;
  description: string;
  category: ProgramCategory;
  level: Difficulty;
  durationWeeks: number;
  weeklyDays: WeeklyDays;
  isPremium: boolean;
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  category: 'full_body',
  level: 'beginner',
  durationWeeks: 4,
  weeklyDays: 3,
  isPremium: true,
};

export default function AdminProgramsScreen() {
  const programs = useAppState((s) => s.programs);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm]           = useState<FormState>(EMPTY_FORM);

  const ds = getDataSource();
  const publishedCount = programs.filter((m) => m.meta.status === 'published').length;

  // ── Modal aç/kapat ────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (m: ManagedProgram) => {
    setEditingId(m.program.id);
    setForm({
      title: m.program.title,
      description: m.program.description,
      category: m.program.category === 'all' ? 'full_body' : m.program.category,
      level: m.program.level === 'all' ? 'beginner' : m.program.level,
      durationWeeks: m.program.durationWeeks,
      weeklyDays: m.program.weeklyDays,
      isPremium: m.meta.isPremium,
    });
    setModalOpen(true);
  };

  // ── Aksiyonlar ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      notify('Eksik Bilgi', 'Program adı ve açıklaması zorunludur.');
      return;
    }
    const input: ProgramInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      level: form.level,
      durationWeeks: form.durationWeeks,
      weeklyDays: form.weeklyDays,
      isPremium: form.isPremium,
    };
    if (editingId) {
      await ds.programs.updateProgram(editingId, input);
      notify('Program Güncellendi', `"${input.title}" kaydedildi.`);
    } else {
      await ds.programs.createProgram(input);
      notify(
        'Program Oluşturuldu',
        `"${input.title}" taslak olarak eklendi. Mobilde görünmesi için yayınla.`,
      );
    }
    setModalOpen(false);
  };

  const handleDelete = async (m: ManagedProgram) => {
    const ok = await confirmAction(
      'Programı Sil',
      `"${m.program.title}" kalıcı olarak silinecek ve atandığı kullanıcılardan kaldırılacak. Emin misin?`,
    );
    if (!ok) return;
    await ds.programs.deleteProgram(m.program.id);
    notify('Program Silindi', `"${m.program.title}" kaldırıldı.`);
  };

  const togglePublish = async (m: ManagedProgram) => {
    const next = m.meta.status === 'published' ? 'draft' : 'published';
    await ds.programs.setStatus(m.program.id, next);
    notify(
      next === 'published' ? 'Yayınlandı' : 'Yayından Kaldırıldı',
      `"${m.program.title}" ${next === 'published' ? 'artık mobil uygulamada görünür.' : 'mobil uygulamadan gizlendi.'}`,
    );
  };

  const togglePremium = async (m: ManagedProgram) => {
    await ds.programs.setPremium(m.program.id, !m.meta.isPremium);
  };

  // ── Tablo ─────────────────────────────────────────────────────────────────
  const columns: TableColumn<ManagedProgram>[] = [
    { key: 'title', title: 'Program Adı', width: 190, flex: 2, value: (m) => m.program.title },
    { key: 'goal',  title: 'Hedef',  width: 110, value: (m) => CATEGORY_LABELS[m.program.category] ?? m.program.category },
    { key: 'level', title: 'Seviye', width: 100, value: (m) => DIFFICULTY_LABELS[m.program.level] },
    { key: 'weeks', title: 'Süre',   width: 110, value: (m) => `${m.program.durationWeeks} hf · ${m.program.weeklyDays} gün` },
    {
      key: 'premium', title: 'Erişim', width: 110,
      render: (m) => (
        <StatusBadge
          label={m.meta.isPremium ? 'Premium' : 'Ücretsiz'}
          tone={m.meta.isPremium ? 'gold' : 'muted'}
        />
      ),
    },
    {
      key: 'status', title: 'Yayın', width: 110,
      render: (m) => (
        <StatusBadge
          label={CONTENT_STATUS_LABELS[m.meta.status]}
          tone={m.meta.status === 'published' ? 'success' : 'warning'}
        />
      ),
    },
    {
      key: 'actions', title: 'İşlemler', width: 330,
      render: (m) => (
        <View style={styles.actionsCell}>
          <AdminButton label="Düzenle" size="sm" variant="ghost" icon="create-outline" onPress={() => openEdit(m)} />
          <AdminButton
            label={m.meta.status === 'published' ? 'Yayından Kaldır' : 'Yayınla'}
            size="sm"
            variant={m.meta.status === 'published' ? 'ghost' : 'outline'}
            onPress={() => togglePublish(m)}
          />
          <AdminButton
            label={m.meta.isPremium ? 'Ücretsiz Yap' : 'Premium Yap'}
            size="sm"
            variant="ghost"
            icon="star-outline"
            onPress={() => togglePremium(m)}
          />
          <AdminButton label="Sil" size="sm" variant="danger" icon="trash-outline" onPress={() => handleDelete(m)} />
        </View>
      ),
    },
  ];

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
            onPress={openCreate}
          />
        }
      />

      <AdminCard>
        <DataTable columns={columns} data={programs} keyExtractor={(m) => m.program.id} />
        <Text style={styles.footNote}>
          Yayındaki programlar mobil uygulamadaki katalogda anında görünür
        </Text>
      </AdminCard>

      {/* ── Oluştur / düzenle modalı ── */}
      <AdminModal
        visible={modalOpen}
        title={editingId ? 'Programı Düzenle' : 'Yeni Program'}
        subtitle={
          editingId
            ? 'Değişiklikler mobil uygulamaya anında yansır'
            : 'Haftalık plan, antrenman kataloğundan otomatik oluşturulur'
        }
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <AdminButton label="Vazgeç" variant="ghost" onPress={() => setModalOpen(false)} />
            <AdminButton
              label={editingId ? 'Kaydet' : 'Oluştur'}
              icon="checkmark-outline"
              variant="primary"
              onPress={handleSave}
            />
          </>
        }
      >
        <FormField
          label="Program Adı"
          value={form.title}
          onChangeText={(title) => setForm((f) => ({ ...f, title }))}
          placeholder="Örn: 8 Haftalık Dönüşüm"
          maxLength={60}
        />
        <FormField
          label="Açıklama"
          value={form.description}
          onChangeText={(description) => setForm((f) => ({ ...f, description }))}
          placeholder="Programın hedefini ve kime uygun olduğunu açıkla..."
          multiline
          maxLength={240}
        />
        <ChipSelect
          label="Kategori"
          options={CATEGORY_OPTIONS}
          value={form.category}
          onChange={(category) => setForm((f) => ({ ...f, category }))}
        />
        <ChipSelect
          label="Seviye"
          options={LEVEL_OPTIONS}
          value={form.level}
          onChange={(level) => setForm((f) => ({ ...f, level }))}
        />
        <ChipSelect
          label="Süre"
          options={WEEK_OPTIONS}
          value={form.durationWeeks}
          onChange={(durationWeeks) => setForm((f) => ({ ...f, durationWeeks }))}
        />
        <ChipSelect
          label="Haftalık Gün"
          options={DAY_OPTIONS}
          value={form.weeklyDays}
          onChange={(weeklyDays) => setForm((f) => ({ ...f, weeklyDays }))}
        />
        <ToggleRow
          label="Premium Program"
          description="Sadece premium üyelere atanabilir ve premium katalogda yer alır"
          value={form.isPremium}
          onChange={(isPremium) => setForm((f) => ({ ...f, isPremium }))}
        />
      </AdminModal>
    </>
  );
}

const styles = StyleSheet.create({
  actionsCell: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  footNote: { ...typography.caption, color: colors.textMuted },
});
