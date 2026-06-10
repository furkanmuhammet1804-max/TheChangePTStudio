/**
 * Antrenman sonrası paylaşım kartı.
 *
 * Şimdilik: markalı özet kartı + sistem paylaşım menüsüne metin gönderme.
 * İleride: kartın görüntüsü (view-shot) alınıp görsel olarak paylaşılacak.
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BrandLogo } from '@/src/components/ui/BrandLogo';
import { APP_NAME } from '@/src/constants/strings';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';
import { WorkoutLog } from '@/src/types';
import { formatSeconds } from '@/src/utils/formatters';
import { hapticTap } from '@/src/utils/haptics';

interface WorkoutShareCardProps {
  log: WorkoutLog;
  workoutName: string;
}

function buildShareText(log: WorkoutLog, workoutName: string): string {
  const lines = [
    'Bugün antrenmanımı tamamladım. 💪',
    `${workoutName} · ${APP_NAME}`,
    `Süre: ${formatSeconds(log.durationSeconds)}`,
  ];
  if (log.totalVolume > 0) lines.push(`Toplam hacim: ${Math.round(log.totalVolume)} kg`);
  lines.push(`Tamamlanan hareket: ${log.exercises.length}`);
  return lines.join('\n');
}

export function WorkoutShareCard({ log, workoutName }: WorkoutShareCardProps) {
  const handleShare = async () => {
    hapticTap();
    try {
      await Share.share({ message: buildShareText(log, workoutName) });
    } catch {
      // Kullanıcı paylaşımı iptal etti veya platform desteklemiyor — sessiz geç
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.brandRow}>
        <BrandLogo height={20} />
      </View>

      <Text style={styles.headline}>Bugün antrenmanımı tamamladım.</Text>
      <Text style={styles.workoutName}>{workoutName}</Text>

      <View style={styles.statsRow}>
        <ShareStat icon="time-outline" label="Süre" value={formatSeconds(log.durationSeconds)} />
        {log.totalVolume > 0 && (
          <ShareStat icon="trending-up-outline" label="Hacim" value={`${Math.round(log.totalVolume)} kg`} />
        )}
        <ShareStat icon="barbell-outline" label="Hareket" value={String(log.exercises.length)} />
      </View>

      <TouchableOpacity
        style={styles.shareBtn}
        onPress={handleShare}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Antrenmanı paylaş"
      >
        <Ionicons name="share-social-outline" size={16} color={colors.background} />
        <Text style={styles.shareLabel}>PAYLAŞ</Text>
      </TouchableOpacity>
    </View>
  );
}

function ShareStat({
  icon, label, value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={16} color={colors.accent} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headline: { ...typography.h4, color: colors.text },
  workoutName: { ...typography.bodySmall, color: colors.textSecondary },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stat: { alignItems: 'center', gap: 2 },
  statValue: { ...typography.bodyMedium, color: colors.text, fontWeight: '700' },
  statLabel: { ...typography.caption, color: colors.textSecondary },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    ...shadows.accent,
  },
  shareLabel: { ...typography.label, color: colors.background, fontWeight: '800', letterSpacing: 1 },
});
