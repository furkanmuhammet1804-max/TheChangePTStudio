import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PremiumLockCard } from '@/src/components/premium/PremiumLockCard';
import { UPGRADE_MESSAGES } from '@/src/constants/strings';
import { colors, borderRadius, spacing, typography } from '@/src/theme';
import { hapticWarning } from '@/src/utils/haptics';

interface LockedFeature {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}

interface LockedScreenProps {
  headerTitle: string;
  headerSubtitle?: string;
  lockTitle: string;
  /** Verilmezse genel nazik yükseltme mesajı gösterilir */
  lockMessage?: string;
  /** What the user will get — shown as a value preview, not a sales pitch */
  features?: LockedFeature[];
}

/**
 * Full-tab gentle gate for premium-only screens (programs, progress).
 * Shows the value the feature provides instead of a hard paywall.
 */
export function LockedScreen({
  headerTitle,
  headerSubtitle,
  lockTitle,
  lockMessage = UPGRADE_MESSAGES.generic,
  features = [],
}: LockedScreenProps) {
  // Premium kilit ekranı açıldığında hafif uyarı haptiği
  useEffect(() => {
    hapticWarning();
  }, []);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{headerTitle}</Text>
        {!!headerSubtitle && <Text style={styles.subtitle}>{headerSubtitle}</Text>}
      </View>

      <PremiumLockCard title={lockTitle} message={lockMessage} />

      {features.length > 0 && (
        <View style={styles.featureList}>
          {features.map((f) => (
            <View key={f.label} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={18} color={colors.accent} />
              </View>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  header: { marginBottom: spacing.sm },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  featureList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: { ...typography.bodyMedium, color: colors.text, flex: 1 },
});
