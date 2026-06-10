import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseCard } from '@/src/components/cards/ExerciseCard';
import { useUser } from '@/src/contexts/UserContext';
import {
  ENVIRONMENT_LABELS,
  EQUIPMENT_LABELS,
  MUSCLE_LABELS,
  MUSCLE_TAGLINES,
} from '@/src/constants/strings';
import { exercises } from '@/src/data/exercises';
import { borderRadius, colors, spacing, typography } from '@/src/theme';
import { Environment, Equipment, MuscleGroup } from '@/src/types';

const MUSCLE_GROUPS = [
  'all',
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'legs',
  'glutes',
  'core',
  'cardio',
  'mobility',
] as const;

const ENVIRONMENTS = ['all', 'home', 'gym', 'outdoor'] as const;

const EQUIPMENT_OPTIONS = [
  'all',
  'none',
  'resistance_bands',
  'dumbbells',
  'kettlebell',
  'barbell',
  'machine',
  'cables',
  'trx',
] as const;

type MuscleFilter      = 'all' | MuscleGroup;
type EnvironmentFilter = 'all' | Environment;
type EquipmentFilter   = 'all' | Equipment;

export default function ExercisesScreen() {
  const params = useLocalSearchParams<{ muscle?: string; favorites?: string }>();
  const { favoriteExerciseIds } = useUser();

  const [activeGroup, setActiveGroup]         = useState<MuscleFilter>('all');
  const [activeEnv, setActiveEnv]             = useState<EnvironmentFilter>('all');
  const [activeEquipment, setActiveEquipment] = useState<EquipmentFilter>('all');
  const [favoritesOnly, setFavoritesOnly]     = useState(false);
  const [search, setSearch]                   = useState('');

  // Apply navigation params from home shortcuts (muscle chip / favorites)
  useEffect(() => {
    if (params.muscle && (MUSCLE_GROUPS as readonly string[]).includes(params.muscle)) {
      setActiveGroup(params.muscle as MuscleFilter);
    }
    if (params.favorites === '1') {
      setFavoritesOnly(true);
    }
  }, [params.muscle, params.favorites]);

  const filtered = useMemo(() => {
    let list = exercises;
    if (favoritesOnly) {
      list = list.filter((e) => favoriteExerciseIds.includes(e.id));
    }
    if (activeGroup !== 'all') {
      list = list.filter((e) => e.muscleGroup === activeGroup);
    }
    if (activeEnv !== 'all') {
      list = list.filter((e) => e.environments.includes(activeEnv));
    }
    if (activeEquipment !== 'all') {
      list = list.filter((e) => e.equipment === activeEquipment);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (MUSCLE_LABELS[e.muscleGroup] ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [activeGroup, activeEnv, activeEquipment, favoritesOnly, search, favoriteExerciseIds]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Egzersiz Kütüphanesi</Text>
        <Text style={styles.subtitle}>
          {favoritesOnly
            ? `Favorilerin · ${filtered.length} hareket`
            : activeGroup === 'all'
            ? `${exercises.length} hareket · doğru formu öğren`
            : `${MUSCLE_LABELS[activeGroup]} · ${MUSCLE_TAGLINES[activeGroup]}`}
        </Text>
      </View>

      {/* Search + favorites toggle */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Egzersiz ara... (örn: arka omuz, squat)"
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
        <TouchableOpacity
          style={[styles.favToggle, favoritesOnly && styles.favToggleActive]}
          onPress={() => setFavoritesOnly((v) => !v)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={favoritesOnly ? 'heart' : 'heart-outline'}
            size={20}
            color={favoritesOnly ? colors.error : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Muscle Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {MUSCLE_GROUPS.map((item) => (
          <FilterChip
            key={item}
            label={item === 'all' ? 'Tümü' : MUSCLE_LABELS[item]}
            active={activeGroup === item}
            onPress={() => setActiveGroup(item)}
          />
        ))}
      </ScrollView>

      {/* Environment + Equipment Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {ENVIRONMENTS.map((env) => (
          <FilterChip
            key={`env_${env}`}
            icon={env === 'home' ? 'home-outline' : env === 'gym' ? 'barbell-outline' : env === 'outdoor' ? 'sunny-outline' : undefined}
            label={env === 'all' ? 'Her Ortam' : ENVIRONMENT_LABELS[env]}
            active={activeEnv === env}
            onPress={() => setActiveEnv(env)}
          />
        ))}
        <View style={styles.filterDivider} />
        {EQUIPMENT_OPTIONS.map((eq) => (
          <FilterChip
            key={`eq_${eq}`}
            label={eq === 'all' ? 'Her Ekipman' : EQUIPMENT_LABELS[eq]}
            active={activeEquipment === eq}
            onPress={() => setActiveEquipment(eq)}
          />
        ))}
      </ScrollView>

      {/* Exercise List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ExerciseCard exercise={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name={favoritesOnly ? 'heart-outline' : 'search-outline'}
              size={36}
              color={colors.textMuted}
            />
            <Text style={styles.emptyText}>
              {favoritesOnly
                ? 'Henüz favori hareketin yok.\nBir hareketin detayında kalbe dokunarak ekleyebilirsin.'
                : 'Sonuç bulunamadı.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function FilterChip({
  label, active, onPress, icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      activeOpacity={0.8}
    >
      {icon && (
        <Ionicons name={icon} size={14} color={active ? colors.background : colors.textSecondary} />
      )}
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </TouchableOpacity>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.text,
    padding: 0,
  },
  favToggle: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favToggleActive: {
    borderColor: colors.error,
    backgroundColor: 'rgba(255,75,75,0.1)',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm + 2,
    gap: spacing.sm,
    alignItems: 'center',
  },
  filterDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
  list: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
