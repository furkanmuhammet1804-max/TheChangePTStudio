import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LockedScreen } from '@/src/components/premium/LockedScreen';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { useUser } from '@/src/contexts/UserContext';
import { UPGRADE_MESSAGES } from '@/src/constants/strings';
import { getWorkoutById } from '@/src/data/workouts';
import { evaluateAchievements } from '@/src/lib/achievements';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';
import { calcBMI, formatDate, formatSeconds, formatWeight } from '@/src/utils/formatters';
import { notify } from '@/src/utils/notify';

export default function ProgressScreen() {
  const {
    profile,
    progress,
    addWeightEntry,
    workoutLogs,
    totalWorkouts,
    currentStreak,
    weeklyCompletedCount,
    activeProgram,
    isPremium,
    getProgram,
    favoriteExerciseIds,
  } = useUser();

  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [newWeight, setNewWeight]                   = useState('');

  const currentWeight =
    progress.weightHistory.length > 0
      ? progress.weightHistory[progress.weightHistory.length - 1].weight
      : profile?.weight ?? 0;

  const startingWeight = profile?.startingWeight ?? profile?.weight ?? 0;
  const targetWeight   = profile?.targetWeight   ?? profile?.weight ?? 0;

  const weightProgress =
    startingWeight !== targetWeight
      ? Math.min(
          1,
          Math.abs(startingWeight - currentWeight) /
            Math.abs(startingWeight - targetWeight),
        )
      : 1;

  const bmi = profile ? calcBMI(currentWeight, profile.height) : 0;

  // Program progress
  const programProgress = useMemo(() => {
    if (!activeProgram) return null;
    const program = getProgram(activeProgram.programId);
    if (!program) return null;
    const totalSessions = program.weeks.reduce((sum, w) => sum + w.workouts.length, 0);
    const done          = activeProgram.completedSessions.length;
    return {
      title:          program.title,
      durationWeeks:  program.durationWeeks,
      weekNumber:     activeProgram.weekNumber,
      done,
      total:          totalSessions,
      percent:        done / totalSessions,
    };
  }, [activeProgram, getProgram]);

  // Recent workout history (last 10)
  const recentLogs = useMemo(
    () => [...workoutLogs].reverse().slice(0, 10),
    [workoutLogs],
  );

  // Total volume this week
  const weeklyVolume = useMemo(() => {
    const weekStart = getWeekStart();
    return workoutLogs
      .filter((l) => l.date >= weekStart)
      .reduce((sum, l) => sum + l.totalVolume, 0);
  }, [workoutLogs]);

  // Başarılar — gerçek kullanıcı verisinden hesaplanır (src/lib/achievements)
  const achievements = useMemo(
    () =>
      evaluateAchievements({
        totalWorkouts,
        currentStreak,
        favoriteCount: favoriteExerciseIds.length,
        workoutLogs,
        activeProgram,
      }),
    [totalWorkouts, currentStreak, favoriteExerciseIds, workoutLogs, activeProgram],
  );

  const handleAddWeight = async () => {
    const w = parseFloat(newWeight);
    if (!isNaN(w) && w > 0) {
      await addWeightEntry(w);
      setNewWeight('');
      setWeightModalVisible(false);
    }
  };

  // İlerleme sistemi premium özelliği — ücretsiz kullanıcıya nazik kilit
  if (!isPremium) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LockedScreen
          headerTitle="Gelişimim"
          headerSubtitle="Detaylı ilerleme takibi Premium üyelere özel"
          lockTitle="Gelişimini detaylı takip et"
          lockMessage={UPGRADE_MESSAGES.progress}
          features={[
            { icon: 'scale-outline',       label: 'Kilo geçmişi' },
            { icon: 'barbell-outline',     label: 'Güç artışı takibi' },
            { icon: 'stats-chart-outline', label: 'Toplam antrenman hacmi' },
            { icon: 'trophy-outline',      label: 'Tamamlanan antrenmanlar' },
            { icon: 'flame-outline',       label: 'Seri takibi' },
          ]}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Gelişimim</Text>
          <Text style={styles.subtitle}>Yolculuğunu takip et</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            icon="trophy-outline"
            value={String(totalWorkouts)}
            label="Toplam"
            color={colors.gold}
          />
          <StatCard
            icon="flame-outline"
            value={String(currentStreak)}
            label="Seri"
            color={colors.accent}
          />
          <StatCard
            icon="calendar-outline"
            value={String(weeklyCompletedCount)}
            label="Bu Hafta"
            color={colors.textSecondary}
          />
          <StatCard
            icon="body-outline"
            value={bmi > 0 ? String(bmi) : '—'}
            label="BMI"
            color={colors.textSecondary}
          />
        </View>

        {/* Active Program Progress */}
        {programProgress && (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({ pathname: '/program/[id]', params: { id: activeProgram!.programId } })
            }
            activeOpacity={0.85}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Aktif Program</Text>
              <View style={styles.weekBadge}>
                <Text style={styles.weekBadgeText}>Hafta {programProgress.weekNumber}/{programProgress.durationWeeks}</Text>
              </View>
            </View>
            <Text style={styles.programTitle}>{programProgress.title}</Text>
            <ProgressBar progress={programProgress.percent} height={8} />
            <Text style={styles.progressHint}>
              {programProgress.done}/{programProgress.total} antrenman tamamlandı (
              {Math.round(programProgress.percent * 100)}%)
            </Text>
          </TouchableOpacity>
        )}

        {/* Weight Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Kilo Takibi</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setWeightModalVisible(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={18} color={colors.background} />
              <Text style={styles.addBtnLabel}>Ekle</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weightRow}>
            <WeightPoint label="Başlangıç" value={formatWeight(startingWeight)} />
            <WeightPoint label="Şu An"     value={formatWeight(currentWeight)} accent />
            <WeightPoint label="Hedef"     value={formatWeight(targetWeight)} />
          </View>

          <ProgressBar progress={weightProgress} height={10} />

          <Text style={styles.progressHint}>
            {weightProgress >= 1
              ? 'Hedef kiloya ulaştın!'
              : `Hedefe ${Math.abs(currentWeight - targetWeight).toFixed(1)} kg kaldı`}
          </Text>
        </View>

        {/* Weight History */}
        {progress.weightHistory.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Kilo Geçmişi</Text>
            <View style={styles.historyList}>
              {[...progress.weightHistory]
                .reverse()
                .slice(0, 8)
                .map((entry, i) => (
                  <View key={i} style={styles.historyRow}>
                    <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
                    <Text style={styles.historyWeight}>{formatWeight(entry.weight)}</Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Workout History */}
        {recentLogs.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Son Antrenmanlar</Text>
            <View style={styles.historyList}>
              {recentLogs.map((log) => {
                const w = getWorkoutById(log.workoutId);
                return (
                  <View key={log.id} style={styles.workoutHistoryRow}>
                    <View style={styles.workoutHistoryIconBox}>
                      <Ionicons name="barbell-outline" size={18} color={colors.accent} />
                    </View>
                    <View style={styles.workoutHistoryInfo}>
                      <Text style={styles.workoutHistoryName}>{w?.name ?? log.workoutId}</Text>
                      <Text style={styles.workoutHistoryMeta}>
                        {formatDate(log.date)} · {formatSeconds(log.durationSeconds)}
                        {log.totalVolume > 0 ? ` · ${Math.round(log.totalVolume)} kg` : ''}
                      </Text>
                    </View>
                    <Text style={styles.workoutHistorySets}>
                      {log.exercises.reduce((n, ex) => n + ex.sets.length, 0)} set
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Weekly Volume */}
        {weeklyVolume > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Bu Haftaki Hacim</Text>
              <Text style={styles.volumeValue}>{Math.round(weeklyVolume)} kg</Text>
            </View>
            <Text style={styles.progressHint}>Kaldırılan toplam ağırlık (ağırlık × tekrar)</Text>
          </View>
        )}

        {/* Achievements */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Başarılar</Text>
            <Text style={styles.achievementCount}>
              {achievements.filter((a) => a.unlocked).length}/{achievements.length}
            </Text>
          </View>
          {achievements.map((a) => (
            <AchievementItem
              key={a.id}
              icon={a.icon}
              label={a.title}
              description={a.description}
              unlocked={a.unlocked}
            />
          ))}
        </View>

        {/* Transformation: önce / sonra */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Önce / Sonra</Text>
          <View style={styles.photoRow}>
            <PhotoPlaceholder label="Önce" />
            <PhotoPlaceholder label="Sonra" />
          </View>
          <Text style={styles.photoHint}>
            Dönüşümünü belgelemek için önce/sonra fotoğraflarını ekle
          </Text>
        </View>
      </ScrollView>

      {/* Weight Modal */}
      <Modal
        visible={weightModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWeightModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Kilo Ekle</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Örn: 73.5"
              placeholderTextColor={colors.textMuted}
              value={newWeight}
              onChangeText={setNewWeight}
              keyboardType="decimal-pad"
              selectionColor={colors.accent}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setWeightModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleAddWeight}>
                <Text style={styles.modalConfirmText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function getWeekStart(): string {
  const now  = new Date();
  const day  = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(new Date(now).setDate(diff)).toISOString().split('T')[0];
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  icon, value, label, color,
}: {
  icon:  React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  label: string;
  color: string;
}) {
  return (
    <View style={[statStyles.card, { borderTopColor: color }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
    borderTopWidth: 3,
    ...shadows.sm,
  },
  value: { ...typography.h4, color: colors.text },
  label: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
});

function WeightPoint({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <Text style={[typography.label, { color: colors.textMuted, textTransform: 'uppercase' }]}>
        {label}
      </Text>
      <Text style={[typography.h3, { color: accent ? colors.accent : colors.text }]}>{value}</Text>
    </View>
  );
}

function AchievementItem({
  icon, label, description, unlocked,
}: {
  icon:        React.ComponentProps<typeof Ionicons>['name'];
  label:       string;
  description: string;
  unlocked:    boolean;
}) {
  return (
    <View style={achieveStyles.row}>
      <View style={[achieveStyles.iconBox, unlocked && achieveStyles.iconBoxActive]}>
        <Ionicons name={icon} size={20} color={unlocked ? colors.gold : colors.textMuted} />
      </View>
      <View style={achieveStyles.info}>
        <Text style={[achieveStyles.label, !unlocked && achieveStyles.labelLocked]}>{label}</Text>
        <Text style={achieveStyles.desc}>{description}</Text>
      </View>
      {unlocked && <Ionicons name="checkmark-circle" size={18} color={colors.success} />}
    </View>
  );
}

const achieveStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBox:       { width: 40, height: 40, borderRadius: borderRadius.md, backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
  iconBoxActive: { backgroundColor: colors.goldMuted },
  info:          { flex: 1, gap: 1 },
  label:         { ...typography.bodyMedium, color: colors.text },
  labelLocked:   { color: colors.textMuted },
  desc:          { ...typography.caption, color: colors.textSecondary },
});

function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <TouchableOpacity
      style={photoStyles.box}
      activeOpacity={0.8}
      onPress={() =>
        notify('Fotoğraf Ekle', 'Fotoğraf yükleme, depolama altyapısı bağlandığında aktifleşecek.')
      }
      accessibilityRole="button"
      accessibilityLabel={`${label} fotoğrafı ekle`}
    >
      <Ionicons name="add-circle-outline" size={32} color={colors.accent} />
      <Text style={photoStyles.label}>{label}</Text>
      <Text style={photoStyles.hint}>Fotoğraf Ekle</Text>
    </TouchableOpacity>
  );
}

const photoStyles = StyleSheet.create({
  box: {
    flex: 1,
    aspectRatio: 0.75,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  label: { ...typography.label, color: colors.textMuted },
  hint:  { ...typography.caption, color: colors.accent },
});

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll:   { flex: 1 },
  content:  { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  header:   { marginBottom: spacing.sm },
  title:    { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: 4 },

  statsRow: { flexDirection: 'row', gap: spacing.sm },

  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle:   { ...typography.h4, color: colors.text },
  programTitle:{ ...typography.bodyMedium, color: colors.textSecondary },

  weekBadge: {
    backgroundColor: colors.accentMuted,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  weekBadgeText: { ...typography.caption, color: colors.accent },

  volumeValue: { ...typography.h3, color: colors.accent },
  achievementCount: { ...typography.bodySmall, color: colors.gold, fontWeight: '700' },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  addBtnLabel: { ...typography.label, color: colors.background, fontWeight: '700' },

  weightRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressHint: { ...typography.bodySmall, color: colors.textSecondary },

  historyList: { gap: spacing.xs },
  historyRow:  {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyDate:   { ...typography.bodySmall, color: colors.textSecondary },
  historyWeight: { ...typography.bodyMedium, color: colors.text },

  workoutHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  workoutHistoryIconBox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutHistoryInfo: { flex: 1 },
  workoutHistoryName: { ...typography.bodyMedium, color: colors.text },
  workoutHistoryMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  workoutHistorySets: { ...typography.caption, color: colors.textMuted },

  photoRow: { flexDirection: 'row', gap: spacing.md },
  photoHint: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },

  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlayStrong,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: { ...typography.h3, color: colors.text },
  modalInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtons:     { flexDirection: 'row', gap: spacing.md },
  modalCancel:      { flex: 1, padding: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.surfaceSecondary, alignItems: 'center' },
  modalCancelText:  { ...typography.bodyMedium, color: colors.textSecondary },
  modalConfirm:     { flex: 1, padding: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.accent, alignItems: 'center' },
  modalConfirmText: { ...typography.bodyMedium, color: colors.background, fontWeight: '700' },
});
