import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LockedScreen } from '@/src/components/premium/LockedScreen';
import { Button } from '@/src/components/ui/Button';
import { useUser } from '@/src/contexts/UserContext';
import {
  DIFFICULTY_LABELS,
  GOAL_LABELS,
  UPGRADE_MESSAGES,
} from '@/src/constants/strings';
import { generatePersonalProgram } from '@/src/utils/programGenerator';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';
import { Difficulty, TrainingLocation, UserGoal, WeeklyDays } from '@/src/types';

export default function CreateProgramScreen() {
  const { profile, isPremium, saveProfile, saveCustomProgram, startProgram, abandonProgram, activeProgram } = useUser();

  const [goal,       setGoal]       = useState<UserGoal>(profile?.goal ?? 'beginner');
  const [level,      setLevel]      = useState<Difficulty>(profile?.level ?? 'beginner');
  const [weeklyDays, setWeeklyDays] = useState<WeeklyDays>(profile?.weeklyDays ?? 3);
  const [location,   setLocation]   = useState<TrainingLocation>(profile?.trainingLocation ?? 'gym');
  const [creating,   setCreating]   = useState(false);

  if (!isPremium) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <BackHeader />
        <LockedScreen
          headerTitle="Kişisel Program"
          lockTitle="Sana özel program Premium ile"
          lockMessage={UPGRADE_MESSAGES.program}
        />
      </SafeAreaView>
    );
  }

  const handleCreate = async () => {
    if (!profile) return;
    setCreating(true);
    try {
      // Keep profile in sync with the latest choices
      await saveProfile({ ...profile, goal, level, weeklyDays, trainingLocation: location });

      const program = generatePersonalProgram({
        name: profile.name,
        goal,
        level,
        weeklyDays,
        trainingLocation: location,
      });
      await saveCustomProgram(program);

      if (activeProgram) await abandonProgram();
      await startProgram(program.id);

      router.replace({ pathname: '/program/[id]', params: { id: program.id } });
    } catch {
      Alert.alert('Hata', 'Program oluşturulamadı. Tekrar dene.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <BackHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>SANA ÖZEL</Text>
          <Text style={styles.title}>Programını Oluştur</Text>
          <Text style={styles.subtitle}>
            Bilgilerin profilinden alındı. Aşağıdan istediğini değiştir, programın saniyeler içinde hazır olsun.
          </Text>
        </View>

        {/* Profile summary */}
        {profile && (
          <View style={styles.summaryCard}>
            <SummaryItem icon="person-outline"   label="Yaş"      value={`${profile.age}`} />
            <SummaryItem icon="resize-outline"   label="Boy"      value={`${profile.height} cm`} />
            <SummaryItem icon="scale-outline"    label="Kilo"     value={`${profile.weight} kg`} />
            <SummaryItem
              icon="male-female-outline"
              label="Cinsiyet"
              value={profile.gender === 'male' ? 'Erkek' : profile.gender === 'female' ? 'Kadın' : 'Diğer'}
            />
          </View>
        )}

        {/* Goal */}
        <Text style={styles.sectionTitle}>Hedefin</Text>
        <View style={styles.chipWrap}>
          {(Object.keys(GOAL_LABELS) as UserGoal[]).map((g) => (
            <Chip key={g} label={GOAL_LABELS[g]} selected={goal === g} onPress={() => setGoal(g)} />
          ))}
        </View>

        {/* Level */}
        <Text style={styles.sectionTitle}>Seviyen</Text>
        <View style={styles.chipWrap}>
          {(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map((l) => (
            <Chip key={l} label={DIFFICULTY_LABELS[l]} selected={level === l} onPress={() => setLevel(l)} />
          ))}
        </View>

        {/* Weekly days */}
        <Text style={styles.sectionTitle}>Haftada kaç gün?</Text>
        <View style={styles.dayGrid}>
          {([2, 3, 4, 5] as WeeklyDays[]).map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.dayBox, weeklyDays === d && styles.dayBoxActive]}
              onPress={() => setWeeklyDays(d)}
              activeOpacity={0.85}
            >
              <Text style={[styles.dayNumber, weeklyDays === d && styles.dayNumberActive]}>{d}</Text>
              <Text style={styles.dayLabel}>gün</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Location */}
        <Text style={styles.sectionTitle}>Nerede çalışacaksın?</Text>
        <View style={styles.chipWrap}>
          <Chip label="Evde"        selected={location === 'home'}  onPress={() => setLocation('home')} />
          <Chip label="Spor Salonu" selected={location === 'gym'}   onPress={() => setLocation('gym')} />
          <Chip label="Karışık"     selected={location === 'mixed'} onPress={() => setLocation('mixed')} />
        </View>

        {activeProgram && (
          <View style={styles.warnBox}>
            <Ionicons name="information-circle-outline" size={18} color={colors.warning} />
            <Text style={styles.warnText}>
              Yeni programın oluşturulduğunda mevcut aktif programın sonlanacak.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={creating ? 'OLUŞTURULUYOR…' : 'PROGRAMIMI OLUŞTUR'}
          onPress={handleCreate}
          fullWidth
          size="lg"
          disabled={creating || !profile}
        />
      </View>
    </SafeAreaView>
  );
}

function BackHeader() {
  return (
    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
      <Ionicons name="arrow-back" size={22} color={colors.text} />
      <Text style={styles.backLabel}>Programlar</Text>
    </TouchableOpacity>
  );
}

function SummaryItem({
  icon, label, value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryItem}>
      <Ionicons name={icon} size={18} color={colors.accent} />
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  backLabel: { ...typography.body, color: colors.text },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },

  hero: { gap: spacing.xs, marginBottom: spacing.sm },
  eyebrow: { ...typography.label, color: colors.accent, letterSpacing: 2 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },

  summaryCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryValue: { ...typography.bodyMedium, color: colors.text },
  summaryLabel: { ...typography.caption, color: colors.textSecondary },

  sectionTitle: { ...typography.h4, color: colors.text, marginTop: spacing.sm },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.accentMuted, borderColor: colors.accent },
  chipLabel: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '700' },
  chipLabelActive: { color: colors.accent },

  dayGrid: { flexDirection: 'row', gap: spacing.sm },
  dayBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  dayBoxActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  dayNumber: { ...typography.h3, color: colors.textSecondary },
  dayNumberActive: { color: colors.accent },
  dayLabel: { ...typography.caption, color: colors.textMuted },

  warnBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,167,38,0.1)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,167,38,0.3)',
  },
  warnText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },

  footer: {
    padding: spacing.md,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
