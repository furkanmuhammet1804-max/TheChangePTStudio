import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Badge } from '@/src/components/ui/Badge';
import { borderRadius, colors, gradients, shadows, spacing, typography } from '@/src/theme';
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

const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  fat_burn: 'flame',
  muscle_gain: 'barbell',
  core: 'body',
  home: 'home',
  beginner: 'leaf',
  full_body: 'fitness',
  gym: 'barbell',
  all: 'grid',
};

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const accentColor = CATEGORY_COLORS[program.category] ?? colors.accent;
  const icon = CATEGORY_ICONS[program.category] ?? 'fitness';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: '/program/[id]', params: { id: program.id } })}
      style={styles.wrap}
    >
      <LinearGradient
        colors={gradients.surfaceRaised}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header row: category icon + label + badge */}
        <View style={styles.header}>
          <View style={styles.categoryRow}>
            <View style={[styles.iconChip, { backgroundColor: accentColor + '22', borderColor: accentColor + '55' }]}>
              <Ionicons name={icon} size={18} color={accentColor} />
            </View>
            <Text style={[styles.category, { color: accentColor }]}>
              {CATEGORY_LABELS[program.category] ?? program.category}
            </Text>
          </View>
          {program.badge && <Badge label={program.badge} variant="gold" />}
        </View>

        <Text style={styles.title}>{program.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {program.description}
        </Text>

        {/* Spec badges */}
        <View style={styles.specRow}>
          <SpecBadge icon="calendar-outline" label={`${program.durationWeeks} hafta`} />
          <SpecBadge icon="flash-outline" label={DIFFICULTY_LABELS[program.level]} />
          <SpecBadge icon="repeat-outline" label={`${program.weeklyDays} gün/hafta`} />
          <SpecBadge
            icon="barbell-outline"
            label={EQUIPMENT_LABELS[program.equipment[0]] ?? 'Karma'}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function SpecBadge({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) {
  return (
    <View style={styles.specBadge}>
      <Ionicons name={icon} size={13} color={colors.textSecondary} />
      <Text style={styles.specLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconChip: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  category: {
    ...typography.label,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 19,
  },
  specRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  specLabel: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
});
