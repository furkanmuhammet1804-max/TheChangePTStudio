import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FormField } from '@/src/components/admin/forms';
import { AdminButton, AdminCard, PageHeader, StatusBadge } from '@/src/components/admin/ui';
import { resetLocalData, updateAppSettings, useAppState } from '@/src/services/appStore';
import { logoutAdmin } from '@/src/services/adminAuth';
import { borderRadius, colors, spacing, typography } from '@/src/theme';
import { formatRelativeTime } from '@/src/utils/formatters';
import { confirmAction, notify } from '@/src/utils/notify';

export default function AdminSettingsScreen() {
  const settings  = useAppState((s) => s.settings);
  const exercises = useAppState((s) => s.exercises);
  const programs  = useAppState((s) => s.programs);

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [adminEmail, setAdminEmail]   = useState(settings.adminEmail);

  const handleSave = () => {
    if (!companyName.trim() || !adminEmail.trim()) {
      notify('Eksik Bilgi', 'Firma adı ve admin e-postası boş bırakılamaz.');
      return;
    }
    updateAppSettings({
      companyName: companyName.trim(),
      adminEmail: adminEmail.trim(),
    });
    notify('Kaydedildi', 'Genel ayarlar güncellendi.');
  };

  const handleReset = async () => {
    const ok = await confirmAction(
      'Yerel Verileri Sıfırla',
      'Bu cihazdaki tüm kullanıcı, üyelik, içerik değişikliği ve bildirim geçmişi kayıtları silinecek; katalog varsayılana dönecek. Bu işlem geri alınamaz. Emin misin?',
    );
    if (!ok) return;
    await resetLocalData();
    notify('Sıfırlandı', 'Yerel yönetim verileri temizlendi.');
  };

  return (
    <>
      <PageHeader title="Ayarlar" subtitle="Panel ve uygulama yapılandırması" />

      {/* Genel */}
      <AdminCard title="Genel" subtitle="Firma bilgileri ve yönetici hesabı">
        <FormField
          label="Firma Adı"
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="The Change PT Studio"
          maxLength={60}
        />
        <FormField
          label="Admin E-posta"
          value={adminEmail}
          onChangeText={setAdminEmail}
          placeholder="admin@firma.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AdminButton label="Kaydet" icon="checkmark-outline" variant="primary" onPress={handleSave} />
      </AdminCard>

      {/* Sistem durumu */}
      <AdminCard title="Sistem Durumu" subtitle="Servis bağlantıları ve içerik senkronizasyonu">
        <View style={styles.list}>
          <StatusRow
            icon="card-outline"
            label="Ödeme Sistemi"
            desc="Mağaza abonelikleri için RevenueCat hesabı ve ürün tanımları gerekli — servis katmanı hazır"
            badge={settings.paymentsEnabled ? 'Bağlı' : 'Hesap Gerekli'}
            ok={settings.paymentsEnabled}
          />
          <StatusRow
            icon="notifications-outline"
            label="Bildirim Sistemi"
            desc="Yerel bildirimler çalışıyor; tüm cihazlara eşzamanlı dağıtım push sunucusu gerektirir"
            badge={settings.pushEnabled ? 'Push Bağlı' : 'Yerel Aktif'}
            ok
          />
          <StatusRow
            icon="sync-outline"
            label="İçerik Senkronizasyonu"
            desc={`${exercises.length} egzersiz · ${programs.length} program mobil uygulamayla paylaşılıyor`}
            badge={
              settings.lastContentSyncAt
                ? `Son değişiklik ${formatRelativeTime(settings.lastContentSyncAt)}`
                : 'Güncel'
            }
            ok
          />
          <StatusRow
            icon="phone-portrait-outline"
            label="Uygulama Versiyonu"
            desc="Mobil uygulamanın aktif sürümü"
            badge={`v${settings.appVersion}`}
            ok
          />
          <StatusRow
            icon="server-outline"
            label="Veri Kaynağı"
            desc="Yerel depo aktif — Firebase/Supabase bağlantısı için hazır"
            badge="Yerel"
            ok={false}
          />
        </View>
      </AdminCard>

      {/* Tehlikeli işlemler */}
      <AdminCard title="Yönetim" subtitle="Oturum ve veri işlemleri">
        <View style={styles.actionRow}>
          <AdminButton label="Çıkış Yap" icon="log-out-outline" variant="ghost" onPress={() => logoutAdmin()} />
          <AdminButton label="Yerel Verileri Sıfırla" icon="refresh-outline" variant="danger" onPress={handleReset} />
        </View>
      </AdminCard>

      <AdminCard>
        <View style={styles.aboutRow}>
          <View>
            <Text style={styles.aboutTitle}>{settings.companyName} · Admin Panel</Text>
            <Text style={styles.aboutMeta}>Sürüm 1.0.0 · Yerel veri kaynağı aktif</Text>
          </View>
          <StatusBadge label="Çalışıyor" tone="success" />
        </View>
      </AdminCard>
    </>
  );
}

function StatusRow({
  icon,
  label,
  desc,
  badge,
  ok,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  desc: string;
  badge: string;
  ok: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDesc}>{desc}</Text>
      </View>
      <StatusBadge label={badge} tone={ok ? 'success' : 'warning'} />
    </View>
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
    flexWrap: 'wrap',
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: { flex: 1, minWidth: 180 },
  rowLabel: { ...typography.bodyMedium, color: colors.text, fontWeight: '600' },
  rowDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
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
