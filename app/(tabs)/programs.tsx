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
import { CATEGORY_LABELS } from '@/src/constants/strings';
import { programs } from '@/src/data/programs';
import { borderRadius, colors, spacing, typography } from '@/src/theme';
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
  const [activeCategory, setActiveCategory] = useState<ProgramCategory>('all');

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return programs;
    return programs.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const handleCategory = useCallback((cat: ProgramCategory) => {
    setActiveCategory(cat);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Programlar</Text>
        <Text style={styles.subtitle}>Hedefine uygun programı seç</Text>
      </View>

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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
  },
  chipLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipLabelActive: {
    color: colors.accent,
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
});
