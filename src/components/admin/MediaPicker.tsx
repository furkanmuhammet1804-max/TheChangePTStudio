/**
 * Admin egzersiz formu için medya slot seçici.
 *
 * "Görsel Seç / GIF Seç / Video Seç / Thumbnail Seç" butonu + seçim sonrası
 * önizleme (görsellerde küçük preview, videoda dosya adı/boyutu) gösterir.
 * Web'de dosya inputuna, mobil APK'da galeriye açılır (expo-image-picker).
 */
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBadge } from '@/src/components/admin/ui';
import {
  formatFileSize,
  MediaSlot,
  PickedMedia,
  pickForSlot,
  uploadMediaPlaceholder,
} from '@/src/services/mediaUploadService';
import { borderRadius, colors, spacing, typography } from '@/src/theme';
import { notify } from '@/src/utils/notify';

const SLOT_CONFIG: Record<MediaSlot, { label: string; icon: React.ComponentProps<typeof Ionicons>['name']; readyLabel: string }> = {
  image:     { label: 'Görsel Seç',    icon: 'image-outline',    readyLabel: 'Görsel Hazır' },
  gif:       { label: 'GIF Seç',       icon: 'film-outline',     readyLabel: 'GIF Hazır' },
  video:     { label: 'Video Seç',     icon: 'videocam-outline', readyLabel: 'Video Hazır' },
  thumbnail: { label: 'Thumbnail Seç', icon: 'images-outline',   readyLabel: 'Thumbnail Hazır' },
};

interface MediaSlotPickerProps {
  slot: MediaSlot;
  /** Mevcut değer — yerel uri veya uzak URL */
  value: string;
  /** Seçilen dosyanın meta bilgisi (ad/boyut) — sadece bu oturumda seçilenler için */
  meta?: PickedMedia;
  onChange: (uri: string, media?: PickedMedia) => void;
}

export function MediaSlotPicker({ slot, value, meta, onChange }: MediaSlotPickerProps) {
  const [busy, setBusy] = useState(false);
  const config = SLOT_CONFIG[slot];

  const handlePick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await pickForSlot(slot);
      if (result.status === 'invalid') {
        notify('Geçersiz Dosya', result.reason);
        return;
      }
      if (result.status === 'cancelled') return;
      // Storage bağlandığında burada gerçek yükleme yapılır
      const uri = await uploadMediaPlaceholder(result.media);
      onChange(uri, result.media);
    } finally {
      setBusy(false);
    }
  };

  const fileLabel =
    meta?.fileName ??
    (value.startsWith('http') ? value : value.split('/').pop()?.split('?')[0] ?? 'Seçili dosya');

  return (
    <View style={styles.slot}>
      <View style={styles.slotHeader}>
        <Text style={styles.slotLabel}>{config.label.replace(' Seç', '').toUpperCase()}</Text>
        {!!value && <StatusBadge label={config.readyLabel} tone="success" />}
      </View>

      {value ? (
        <View style={styles.previewRow}>
          {slot === 'video' ? (
            <View style={styles.videoIcon}>
              <Ionicons name="videocam" size={22} color={colors.accent} />
            </View>
          ) : (
            <Image source={{ uri: value }} style={styles.previewImage} contentFit="cover" />
          )}
          <View style={styles.previewInfo}>
            <Text style={styles.previewName} numberOfLines={1}>{fileLabel}</Text>
            <Text style={styles.previewMeta}>
              {[formatFileSize(meta?.fileSize), meta?.mimeType].filter(Boolean).join(' · ') ||
                (value.startsWith('http') ? 'Uzak URL' : 'Yerel dosya')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handlePick}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${config.label} — değiştir`}
          >
            {busy
              ? <ActivityIndicator size="small" color={colors.accent} />
              : <Ionicons name="swap-horizontal-outline" size={16} color={colors.accent} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => onChange('', undefined)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${config.label} — kaldır`}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.pickBtn}
          onPress={handlePick}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={config.label}
        >
          {busy ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <>
              <Ionicons name={config.icon} size={18} color={colors.accent} />
              <Text style={styles.pickLabel}>{config.label}</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { gap: spacing.sm },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  slotLabel: { ...typography.label, color: colors.textSecondary, letterSpacing: 1 },

  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceSecondary,
  },
  pickLabel: { ...typography.bodySmall, color: colors.accent, fontWeight: '700' },

  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  previewImage: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceTertiary,
  },
  videoIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: { flex: 1, gap: 2, minWidth: 100 },
  previewName: { ...typography.bodySmall, color: colors.text, fontWeight: '600' },
  previewMeta: { ...typography.caption, color: colors.textSecondary },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
