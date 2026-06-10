import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminCard, PageHeader, StatusBadge } from '@/src/components/admin/ui';
import { notify } from '@/src/utils/notify';
import { borderRadius, colors, spacing, typography } from '@/src/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface SettingItem {
  icon: IconName;
  label: string;
  desc: string;
  soon?: boolean;
}

const GENERAL: SettingItem[] = [
  { icon: 'color-palette-outline', label: 'Marka ve Görünüm',        desc: 'Logo, renkler ve uygulama metinleri' },
  { icon: 'pricetags-outline',     label: 'Plan Fiyatları',          desc: 'Aylık, 3 aylık ve yıllık plan ücretleri' },
  { icon: 'people-circle-outline', label: 'Admin Hesapları',         desc: 'Yönetici kullanıcılar ve yetkiler' },
];

const INTEGRATIONS: SettingItem[] = [
  { icon: 'card-outline',          label: 'Ödeme Sağlayıcı',         desc: 'RevenueCat / İyzico entegrasyonu',        soon: true },
  { icon: 'notifications-outline', label: 'Push Bildirim Servisi',   desc: 'Expo Notifications yapılandırması',       soon: true },
  { icon: 'server-outline',        label: 'Backend & Veritabanı',    desc: 'API bağlantısı ve veri senkronizasyonu',  soon: true },
  { icon: 'cloud-outline',         label: 'Medya Depolama',          desc: 'Egzersiz video/GIF dosyaları için CDN',   soon: true },
];

export default function AdminSettingsScreen() {
  return (
    <>
      <PageHeader
        title="Ayarlar"
        subtitle="Panel ve uygulama yapılandırması"
      />

      <AdminCard title="Genel" subtitle="Uygulama geneli ayarlar">
        <View style={styles.list}>
          {GENERAL.map((item) => (
            <SettingRow key={item.label} item={item} />
          ))}
        </View>
      </AdminCard>

      <AdminCard title="Entegrasyonlar" subtitle="Harici servis bağlantıları">
        <View style={styles.list}>
          {INTEGRATIONS.map((item) => (
            <SettingRow key={item.label} item={item} />
          ))}
        </View>
      </AdminCard>

      <AdminCard>
        <View style={styles.aboutRow}>
          <View>
            <Text style={styles.aboutTitle}>The Change PT Studio · Admin Panel</Text>
            <Text style={styles.aboutMeta}>Sürüm 1.0.0 · Önizleme modu · Mock veri aktif</Text>
          </View>
          <StatusBadge label="Önizleme" tone="accent" />
        </View>
      </AdminCard>
    </>
  );
}

function SettingRow({ item }: { item: SettingItem }) {
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.8}
      onPress={() =>
        notify(
          item.label,
          item.soon
            ? 'Bu entegrasyon backend kurulumuyla birlikte aktifleşecek.'
            : 'Bu ayar sayfası backend ile birlikte aktifleşecek.',
        )
      }
    >
      <View style={styles.rowIcon}>
        <Ionicons name={item.icon} size={18} color={colors.accent} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowLabel}>{item.label}</Text>
        <Text style={styles.rowDesc}>{item.desc}</Text>
      </View>
      {item.soon && <StatusBadge label="Yakında" tone="warning" />}
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  list: { gap: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: { flex: 1 },
  rowLabel: { ...typography.bodyMedium, color: colors.text, fontWeight: '600' },
  rowDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  aboutTitle: { ...typography.bodyMedium, color: colors.text, fontWeight: '700' },
  aboutMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
