import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';

interface CoachNoteCardProps {
  note: string;
}

export function CoachNoteCard({ note }: CoachNoteCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="chatbubble-ellipses" size={18} color={colors.gold} />
        <Text style={styles.label}>KOÇ NOTU</Text>
      </View>
      <Text style={styles.note}>{`"${note}"`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.goldMuted,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.gold,
    letterSpacing: 1.2,
  },
  note: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 24,
  },
});
