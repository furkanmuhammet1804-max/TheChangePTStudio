import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseCard } from '@/src/components/cards/ExerciseCard';
import { MUSCLE_LABELS } from '@/src/constants/strings';
import { exercises } from '@/src/data/exercises';
import { borderRadius, colors, spacing, typography } from '@/src/theme';
import { MuscleGroup } from '@/src/types';

const MUSCLE_GROUPS = [
  'all',
  'chest',
  'back',
  'shoulders',
  'arms',
  'legs',
  'core',
  'cardio',
  'mobility',
] as const;

type FilterGroup = 'all' | MuscleGroup;

export default function ExercisesScreen() {
  const [activeGroup, setActiveGroup] = useState<FilterGroup>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = exercises;
    if (activeGroup !== 'all') {
      list = list.filter((e) => e.muscleGroup === activeGroup);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q));
    }
    return list;
  }, [activeGroup, search]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Egzersiz Kütüphanesi</Text>
        <Text style={styles.subtitle}>{exercises.length} egzersiz · filtrele ve keşfet</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Egzersiz ara..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          selectionColor={colors.accent}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Muscle Filter */}
      <FlatList
        data={MUSCLE_GROUPS as unknown as string[]}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setActiveGroup(item as FilterGroup)}
            style={[styles.chip, activeGroup === item && styles.chipActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipLabel, activeGroup === item && styles.chipLabelActive]}>
              {item === 'all' ? 'Tümü' : MUSCLE_LABELS[item as MuscleGroup]}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Exercise List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ExerciseCard exercise={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Sonuç bulunamadı.</Text>
          </View>
        }
      />
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    padding: 0,
  },
  filterRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
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
