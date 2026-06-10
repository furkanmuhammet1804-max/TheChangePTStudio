/**
 * Mobil Ayarlar ekranı: bildirim tercihleri, sağlık entegrasyonları,
 * dil/tema placeholder'ları, veri sıfırlama ve yasal bağlantılar.
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@/src/contexts/UserContext';
import {
  getHealthProviders,
  HealthProviderInfo,
} from '@/src/services/healthService';
import {
  DEFAULT_NOTIFICATION_PREFS,
  cancelAllScheduled,
  loadNotificationPrefs,
  requestNotificationPermission,
  saveNotificationPrefs,
  scheduleLocalNotification,
} from '@/src/services/localNotifications';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';
import { NotificationPreferences } from '@/src/types';
import { hapticTap } from '@/src/utils/haptics';
import { notify } from '@/src/utils/notify';

export default function SettingsScreen() {
  const { resetAll } = useUser();
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFS);
  const healthProviders = getHealthProviders();

  useEffect(() => {
    loadNotificationPrefs().then(setPrefs);
  }, []);

  const updatePref = async (key: keyof NotificationPreferences, value: boolean) => {
    hapticTap();
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    await saveNotificationPrefs(next);

    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        notify(
          'Bildirim İzni Gerekli',
          'Bildirimleri alabilmek için cihaz ayarlarından uygulamaya bildirim izni vermelisin.',
        );
        return;
      }
      if (key === 'workoutReminders') {
        await scheduleLocalNotification('workout_reminder', { secondsFromNow: 10 });
        notify('Hatırlatmalar Açık', 'İlk hatırlatma bildirimi birazdan gelecek.');
      } else if (key === 'motivation') {
        await scheduleLocalNotification('motivation', { secondsFromNow: 15 });
        notify('Motivasyon Açık', 'İlk motivasyon bildirimi birazdan gelecek.');
      }
    } else if (key === 'workoutReminders') {
      await cancelAllScheduled();
    }
  };

  const handleTestNotification = async () => {
    const granted = await requestNotificationPermission();
    if (!granted) {
      notify(
        'Bildirim İzni Gerekli',
        'Deneme bildirimi için cihaz ayarlarından bildirim izni vermelisin.',
      );
      return;
    }
    const ok = await scheduleLocalNotification('motivation', {
      title: 'Deneme Bildirimi',
      body: 'Bildirimler çalışıyor. Antrenman hatırlatmaların artık cihazına düşecek.',
      secondsFromNow: 5,
    });
    notify(
      ok ? 'Gönderildi' : 'Gönderilemedi',
      ok
        ? 'Deneme bildirimi 5 saniye içinde gelecek.'
        : 'Bu platformda yerel bildirim desteklenmiyor (web). Telefonda dene.',
    );
  };

  const handleHealthPress = (p: HealthProviderInfo) => {
    if (p.status === 'unavailable') {
      notify(p.label, 'Bu entegrasyon bu cihazda kullanılamıyor.');
    } else {
      notify(
        p.label,
        `${p.label} bağlantısı native build gerektirir (Expo Go'da çalışmaz). ` +
          'Servis katmanı hazır; mağaza sürümünde sağlık verisi senkronizasyonu etkinleştirilecek.',
      );
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Verileri Sıfırla',
      'Tüm verilerin silinecek ve uygulama yeniden başlayacak. Devam etmek istiyor musun?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: async () => {
            await resetAll();
            router.replace('/onboarding');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Geri dön"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Ayarlar</Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Bildirimler */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bildirimler</Text>
          <ToggleRow
            icon="barbell-outline"
            label="Antrenman Hatırlatmaları"
            desc="Planlı antrenman günlerinde hatırlatma al"
            value={prefs.workoutReminders}
            onChange={(v) => updatePref('workoutReminders', v)}
          />
          <ToggleRow
            icon="flame-outline"
            label="Motivasyon Bildirimleri"
            desc="Haftalık motivasyon mesajları"
            value={prefs.motivation}
            onChange={(v) => updatePref('motivation', v)}
          />
          <ToggleRow
            icon="megaphone-outline"
            label="Yenilikler ve Duyurular"
            desc="Yeni program ve içerik duyuruları"
            value={prefs.productNews}
            onChange={(v) => updatePref('productNews', v)}
          />
          <SettingsRow
            icon="paper-plane-outline"
            label="Deneme Bildirimi Gönder"
            onPress={handleTestNotification}
          />
        </View>

        {/* Sağlık entegrasyonları */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sağlık Entegrasyonları</Text>
          {healthProviders.map((p) => (
            <SettingsRow
              key={p.provider}
              icon={p.provider === 'apple_health' ? 'heart-outline' : 'fitness-outline'}
              label={p.label}
              badge={p.status === 'unavailable' ? 'Bu cihazda yok' : 'Native build gerekli'}
              onPress={() => handleHealthPress(p)}
            />
          ))}
        </View>

        {/* Uygulama */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Uygulama</Text>
          <SettingsRow
            icon="language-outline"
            label="Dil"
            badge="Türkçe"
            onPress={() =>
              notify('Dil', 'Uygulama Türkçe olarak sunuluyor. Egzersiz adları uluslararası standart gereği İngilizcedir.')
            }
          />
          <SettingsRow
            icon="moon-outline"
            label="Tema"
            badge="Koyu"
            onPress={() =>
              notify('Tema', 'The Change PT Studio, antrenman odağı için koyu temayla tasarlandı.')
            }
          />
        </View>

        {/* Yasal */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Yasal</Text>
          <SettingsRow
            icon="shield-outline"
            label="Gizlilik Politikası"
            onPress={() => notify('Gizlilik Politikası', 'Gizlilik politikası mağaza yayınından önce eklenecek.')}
          />
          <SettingsRow
            icon="document-text-outline"
            label="Kullanım Şartları"
            onPress={() => notify('Kullanım Şartları', 'Kullanım şartları mağaza yayınından önce eklenecek.')}
          />
        </View>

        {/* Veri */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Veri</Text>
          <SettingsRow
            icon="refresh-outline"
            label="Verileri Sıfırla"
            danger
            onPress={handleReset}
          />
        </View>

        <Text style={styles.version}>The Change PT Studio · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Satır bileşenleri ───────────────────────────────────────────────────────

function ToggleRow({
  icon, label, desc, value, onChange,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.iconBox}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <View style={rowStyles.info}>
        <Text style={rowStyles.label}>{label}</Text>
        <Text style={rowStyles.desc}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.surfaceTertiary, true: colors.accentMuted }}
        thumbColor={value ? colors.accent : colors.textSecondary}
        accessibilityLabel={label}
      />
    </View>
  );
}

function SettingsRow({
  icon, label, badge, danger, onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  badge?: string;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={rowStyles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[rowStyles.iconBox, danger && rowStyles.iconBoxDanger]}>
        <Ionicons name={icon} size={18} color={danger ? colors.error : colors.accent} />
      </View>
      <Text style={[rowStyles.label, rowStyles.rowLabelFlex, danger && rowStyles.labelDanger]}>
        {label}
      </Text>
      {!!badge && <Text style={rowStyles.badge}>{badge}</Text>}
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxDanger: { backgroundColor: 'rgba(255,75,75,0.12)' },
  info: { flex: 1, gap: 1 },
  label: { ...typography.bodyMedium, color: colors.text },
  rowLabelFlex: { flex: 1 },
  labelDanger: { color: colors.error },
  desc: { ...typography.caption, color: colors.textSecondary },
  badge: { ...typography.caption, color: colors.textMuted },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  backBtn: { padding: spacing.xs },
  topTitle: { ...typography.h3, color: colors.text, flex: 1, textAlign: 'center' },
  topSpacer: { width: 30 },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardTitle: { ...typography.h4, color: colors.text, marginBottom: spacing.sm },
  version: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
});
