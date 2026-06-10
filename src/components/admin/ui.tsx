/**
 * Admin panel ortak UI bileşenleri — kart, istatistik kartı, sayfa başlığı,
 * durum rozeti ve buton. Mobil uygulamayla aynı tema token'larını kullanır.
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// ─── Card ────────────────────────────────────────────────────────────────────

export function AdminCard({
  title,
  subtitle,
  actions,
  children,
  style,
}: {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.card, style]}>
      {(title || actions) && (
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderText}>
            {!!title && <Text style={styles.cardTitle}>{title}</Text>}
            {!!subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
          </View>
          {actions}
        </View>
      )}
      {children}
    </View>
  );
}

// ─── Page header ─────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <View style={styles.pageHeader}>
      <View style={styles.pageHeaderText}>
        <Text style={styles.pageTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.pageSubtitle}>{subtitle}</Text>}
      </View>
      {actions && <View style={styles.pageActions}>{actions}</View>}
    </View>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  icon,
  trend,
  tone = 'accent',
}: {
  label: string;
  value: string;
  icon: IconName;
  trend?: string;
  tone?: 'accent' | 'gold';
}) {
  const toneColor = tone === 'gold' ? colors.gold : colors.accent;
  const toneBg    = tone === 'gold' ? colors.goldMuted : colors.accentMuted;
  return (
    <View style={styles.statCard}>
      <View style={styles.statTop}>
        <View style={[styles.statIcon, { backgroundColor: toneBg }]}>
          <Ionicons name={icon} size={20} color={toneColor} />
        </View>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {!!trend && (
        <View style={styles.statTrendRow}>
          <Ionicons name="trending-up-outline" size={12} color={colors.success} />
          <Text style={styles.statTrend}>{trend}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Status badge ────────────────────────────────────────────────────────────

export type BadgeTone = 'accent' | 'gold' | 'muted' | 'warning' | 'danger' | 'success';

const BADGE_TONES: Record<BadgeTone, { bg: string; fg: string }> = {
  accent:  { bg: colors.accentMuted,            fg: colors.accent },
  gold:    { bg: colors.goldMuted,              fg: colors.gold },
  muted:   { bg: colors.surfaceTertiary,        fg: colors.textSecondary },
  warning: { bg: 'rgba(255,167,38,0.15)',       fg: colors.warning },
  danger:  { bg: 'rgba(255,75,75,0.15)',        fg: colors.error },
  success: { bg: 'rgba(76,175,80,0.15)',        fg: colors.success },
};

export function StatusBadge({ label, tone = 'muted' }: { label: string; tone?: BadgeTone }) {
  const t = BADGE_TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: t.fg }]} />
      <Text style={[styles.badgeText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

// ─── Button ──────────────────────────────────────────────────────────────────

export function AdminButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  size = 'md',
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}) {
  const isSm = size === 'sm';
  const fg =
    variant === 'primary' ? colors.background
    : variant === 'danger' ? colors.error
    : variant === 'outline' ? colors.accent
    : colors.textSecondary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.btn,
        isSm && styles.btnSm,
        variant === 'primary' && styles.btnPrimary,
        variant === 'outline' && styles.btnOutline,
        variant === 'ghost'   && styles.btnGhost,
        variant === 'danger'  && styles.btnDanger,
      ]}
    >
      {icon && <Ionicons name={icon} size={isSm ? 13 : 16} color={fg} />}
      <Text style={[styles.btnLabel, isSm && styles.btnLabelSm, { color: fg }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  cardHeaderText: { flex: 1, minWidth: 160 },
  cardTitle: { ...typography.h4, color: colors.text },
  cardSubtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },

  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: spacing.md,
    flexWrap: 'wrap',
    marginBottom: spacing.xs,
  },
  pageHeaderText: { flex: 1, minWidth: 200 },
  pageTitle: { ...typography.h2, color: colors.text },
  pageSubtitle: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  pageActions: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },

  statCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    ...shadows.sm,
  },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { ...typography.h2, color: colors.text, marginTop: spacing.xs },
  statLabel: { ...typography.bodySmall, color: colors.textSecondary },
  statTrendRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statTrend: { ...typography.caption, color: colors.success },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { ...typography.caption, fontWeight: '700' },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  btnSm: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
  },
  btnPrimary: { backgroundColor: colors.accent, ...shadows.accent },
  btnOutline: { borderWidth: 1.5, borderColor: colors.accent, backgroundColor: colors.accentSoft },
  btnGhost:   { backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border },
  btnDanger:  { backgroundColor: 'rgba(255,75,75,0.1)', borderWidth: 1, borderColor: 'rgba(255,75,75,0.35)' },
  btnLabel:   { ...typography.bodySmall, fontWeight: '800', letterSpacing: 0.3 },
  btnLabelSm: { ...typography.caption, fontWeight: '800' },
});
