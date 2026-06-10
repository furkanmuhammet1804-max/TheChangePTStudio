import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgramCard } from '@/src/components/cards/ProgramCard';
import { LockedScreen } from '@/src/components/premium/LockedScreen';
import { useUser } from '@/src/contexts/UserContext';
import { CATEGORY_LABELS, UPGRADE_MESSAGES } from '@/src/constants/strings';
import { programs } from '@/src/data/programs';
import { borderRadius, colors, gradients, shadows, spacing, typography } from '@/src/theme';
import { ProgramCategory } from '@/src/types';

const CATEGORIES = [
  'all',
  'fat_burn',
  'muscle_gain',
  'full_body',
  'core',
  'home',
  'gym',
  'beginner',
] as ProgramCategory[];

export default function ProgramsScreen() {
  const { isPremium, customProgram, activeProgram } = useUser();
  const [activeCategory, setActiveCategory] = useState<ProgramCategory>('all');

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return programs;
    return programs.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const handleCategory = useCallback((cat: ProgramCategory) => {
    setActiveCategory(cat);
  }, []);

  // ── Free: value-first gentle gate ──
  if (!isPremium) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LockedScreen
          headerTitle="Programlar"
          headerSubtitle="Kişisel antrenman programları Premium üyelere özel"
          lockTitle="Sana özel programını oluştur"
          lockMessage={UPGRADE_MESSAGES.program}
          features={[
            { icon: 'person-outline',        label: 'Hedefine göre kişisel program' },
            { icon: 'today-outline',         label: 'Günlük antrenman planı' },
            { icon: 'calendar-outline',      label: 'Hafta hafta program takibi' },
            { icon: 'trending-up-outline',   label: 'İlerleme ve gelişim analizi' },
          ]}
        />
      </SafeAreaView>
    );
  }

  // ── Premium: personal program + catalog ──
  const isCustomActive = !!customProgram && activeProgram?.programId === customProgram.id;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Programlar</Text>
        <Text style={styles.subtitle}>Dönüşümüne uygun programı seç</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal program */}
        {customProgram ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              router.push({ pathname: '/program/[id]', params: { id: customProgram.id } })
            }
            style={styles.customWrap}
          >
            <LinearGradient
              colors={gradients.surfaceRaised}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.customCard}
            >
              <View style={styles.customBadgeRow}>
                <View style={styles.customBadge}>
                  <Ionicons name="sparkles" size={12} color={colors.background} />
                  <Text style={styles.customBadgeText}>SANA ÖZEL</Text>
                </View>
                {isCustomActive && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>AKTİF</Text>
                  </View>
                )}
              </View>
              <Text style={styles.customTitle}>{customProgram.title}</Text>
              <Text style={styles.customMeta}>
                {customProgram.durationWeeks} hafta · haftada {customProgram.weeklyDays} gün
              </Text>
              <TouchableOpacity
                style={styles.regenBtn}
                onPress={() => router.push('/program/create')}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-outline" size={14} color={colors.accent} />
                <Text style={styles.regenLabel}>Yeniden oluştur</Text>
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/program/create')}
            style={styles.createWrap}
          >
            <LinearGradient
              colors={gradients.accent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.createCard}
            >
              <View style={styles.createIcon}>
                <Ionicons name="sparkles" size={22} color={colors.accent} />
              </View>
              <View style={styles.createInfo}>
                <Text style={styles.createTitle}>Sana Özel Program Oluştur</Text>
                <Text style={styles.createDesc}>
                  Hedefine, seviyene ve haftalık planına göre
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={colors.background} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => handleCategory(cat)}
              style={[styles.chip, activeCategory === cat && styles.chipActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipLabel, activeCategory === cat && styles.chipLabelActive]}>
                {CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Bu kategoride program bulunamadı.</Text>
          </View>
        ) : (
          filtered.map((p) => <ProgramCard key={p.id} program={p} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  filterRow: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  chipLabelActive: {
    color: colors.background,
  },
  scroll: { flex: 1 },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },

  // Custom program card
  customWrap: { borderRadius: borderRadius.xl, marginTop: spacing.sm, ...shadows.accent },
  customCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  customBadgeRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  customBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  customBadgeText: { ...typography.caption, color: colors.background, fontWeight: '800' },
  activeBadge: {
    backgroundColor: colors.accentMuted,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  activeBadgeText: { ...typography.caption, color: colors.accent, fontWeight: '800' },
  customTitle: { ...typography.h3, color: colors.text },
  customMeta:  { ...typography.bodySmall, color: colors.textSecondary },
  regenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  regenLabel: { ...typography.bodySmall, color: colors.accent, fontWeight: '700' },

  // Create program CTA
  createWrap: { borderRadius: borderRadius.xl, marginTop: spacing.sm, ...shadows.accent },
  createCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  createIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createInfo: { flex: 1 },
  createTitle: { ...typography.h4, color: colors.background },
  createDesc: { ...typography.bodySmall, color: colors.background, opacity: 0.75, marginTop: 2 },
});
