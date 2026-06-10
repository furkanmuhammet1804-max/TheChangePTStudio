import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PREMIUM_CTA } from '@/src/constants/strings';
import { borderRadius, colors, gradients, shadows, spacing, typography } from '@/src/theme';

interface PremiumLockCardProps {
  title: string;
  message: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}

/**
 * Gentle inline upgrade card shown when a free user encounters a
 * premium-only area. No aggressive selling — value first, soft CTA.
 */
export function PremiumLockCard({ title, message, icon = 'lock-closed' }: PremiumLockCardProps) {
  return (
    <LinearGradient
      colors={gradients.surfaceRaised}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={22} color={colors.gold} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity
        style={styles.cta}
        onPress={() => router.push('/premium')}
        activeOpacity={0.85}
      >
        <Ionicons name="star-outline" size={16} color={colors.background} />
        <Text style={styles.ctaLabel}>{PREMIUM_CTA}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.goldMuted,
    overflow: 'hidden',
    ...shadows.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h4,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.sm,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gold,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    marginTop: spacing.sm,
    ...shadows.gold,
  },
  ctaLabel: {
    ...typography.label,
    color: colors.background,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
