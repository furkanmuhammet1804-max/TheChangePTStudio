import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Badge } from '@/src/components/ui/Badge';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
} from '@/src/constants/strings';
import { Program } from '@/src/types';

const CATEGORY_COLORS: Record<string, string> = {
  fat_burn: '#FF6B35',
  muscle_gain: '#4FC3F7',
  core: colors.accent,
  home: '#AB47BC',
  beginner: colors.gold,
  full_body: '#26A69A',
  gym: '#EF5350',
  all: colors.textSecondary,
};

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const accentColor = CATEGORY_COLORS[program.category] ?? colors.accent;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/program/[id]', params: { id: program.id } })}
    >
      <View style={[styles.colorBar, { backgroundColor: accentColor }]} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.category}>
            {CATEGORY_LABELS[program.category] ?? program.category}
          </Text>
          {program.badge && <Badge label={program.badge} variant="gold" />}
        </View>

        <Text style={styles.title}>{program.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {program.description}
        </Text>

        <View style={styles.metaRow}>
          <MetaItem icon="calendar-outline" label={`${program.durationWeeks} hafta`} />
          <MetaItem icon="flash-outline" label={DIFFICULTY_LABELS[program.level]} />
          <MetaItem icon="time-outline" label={`${program.weeklyDays}g/hafta`} />
          <MetaItem
            icon="barbell-outline"
            label={EQUIPMENT_LABELS[program.equipment[0]] ?? 'Karma'}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function MetaItem({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={12} color={colors.textSecondary} />
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    flexDirection: 'row',
    ...shadows.md,
  },
  colorBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  category: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
