import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@/src/contexts/UserContext';
import {
  DIFFICULTY_LABELS,
  GOAL_LABELS,
  LOCATION_LABELS,
} from '@/src/constants/strings';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';
import { formatWeight } from '@/src/utils/formatters';

export default function ProfileScreen() {
  const { profile, totalWorkouts, currentStreak, resetAll, isPremium, setMembership } = useUser();

  const handleLeavePremium = () => {
    Alert.alert(
      'Premium Önizlemeden Çık',
      'Premium özelliklerine erişimin kapanacak. Devam etmek istiyor musun?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Çık', style: 'destructive', onPress: () => setMembership('free') },
      ],
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Sıfırla',
      'Tüm verilerin silinecek ve uygulama yeniden başlayacak. Devam etmek istiyor musun?',
      [
        { text: 'İptal', style: 'cancel' },
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

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Profil yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero */}
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.goalLabel}>{GOAL_LABELS[profile.goal]}</Text>
          <View style={[styles.tierBadge, isPremium && styles.tierBadgePremium]}>
            <Ionicons
              name={isPremium ? 'star' : 'person-outline'}
              size={12}
              color={isPremium ? colors.gold : colors.textSecondary}
            />
            <Text style={[styles.tierBadgeText, isPremium && styles.tierBadgeTextPremium]}>
              {isPremium ? 'PREMIUM ÜYE' : 'ÜCRETSİZ ÜYE'}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <ProfileStat label="Antrenman" value={String(totalWorkouts)} />
          <ProfileStat label="Seri" value={String(currentStreak)} />
          <ProfileStat label="Seviye" value={DIFFICULTY_LABELS[profile.level]} />
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bilgilerim</Text>
          <InfoRow label="Yaş" value={`${profile.age} yaş`} />
          <InfoRow label="Boy" value={`${profile.height} cm`} />
          <InfoRow label="Kilo" value={formatWeight(profile.weight)} />
          <InfoRow label="Hedef Kilo" value={formatWeight(profile.targetWeight)} />
          <InfoRow
            label="Antrenman Yeri"
            value={LOCATION_LABELS[profile.trainingLocation]}
          />
          <InfoRow
            label="Haftalık Hedef"
            value={`${profile.weeklyDays} gün/hafta`}
          />
          <InfoRow
            label="Cinsiyet"
            value={
              profile.gender === 'male'
                ? 'Erkek'
                : profile.gender === 'female'
                ? 'Kadın'
                : 'Diğer'
            }
          />
        </View>

        {/* Premium Banner — only when free, value-focused */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.premiumBanner}
            activeOpacity={0.88}
            onPress={() => router.push('/premium')}
          >
            <View style={styles.premiumBannerLeft}>
              <Text style={styles.premiumTitle}>{"Premium'u Keşfet"}</Text>
              <Text style={styles.premiumSub}>
                Kişiye özel programlar, günlük planlar ve detaylı ilerleme takibi
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={22} color={colors.background} />
          </TouchableOpacity>
        )}

        {/* Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ayarlar</Text>
          <SettingsRow
            icon="create-outline"
            label="Profili Düzenle"
            onPress={() => router.push('/setup')}
          />
          <SettingsRow
            icon={isPremium ? 'star-outline' : 'star'}
            label={isPremium ? 'Üyeliği Yönet' : "Premium'u Keşfet"}
            onPress={() => router.push('/premium')}
          />
          {isPremium && (
            <SettingsRow
              icon="exit-outline"
              label="Premium Önizlemeden Çık"
              onPress={handleLeavePremium}
            />
          )}
          <SettingsRow
            icon="notifications-outline"
            label="Bildirimler"
            onPress={() => Alert.alert('Yakında', 'Bu özellik yakında gelecek.')}
          />
          <SettingsRow
            icon="shield-outline"
            label="Gizlilik Politikası"
            onPress={() => Alert.alert('Gizlilik', 'Gizlilik politikamız hazırlanıyor.')}
          />
          <SettingsRow
            icon="information-circle-outline"
            label="Hakkında"
            onPress={() => Alert.alert('The Change PT Studio', 'Versiyon 1.0.0\nBuilt for your next level.')}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Admin Panel (Önizleme)"
            onPress={() => router.push('/admin')}
          />
          <SettingsRow
            icon="refresh-outline"
            label="Uygulamayı Sıfırla"
            onPress={handleReset}
            danger
          />
        </View>

        <Text style={styles.version}>The Change PT Studio · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={pStatStyles.box}>
      <Text style={pStatStyles.value}>{value}</Text>
      <Text style={pStatStyles.label}>{label}</Text>
    </View>
  );
}

const pStatStyles = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  value: { ...typography.h3, color: colors.accent },
  label: { ...typography.caption, color: colors.textSecondary },
});

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: { ...typography.body, color: colors.textSecondary },
  value: { ...typography.bodyMedium, color: colors.text },
});

function SettingsRow({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={settingStyles.row}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={settingStyles.left}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? colors.error : colors.textSecondary}
        />
        <Text style={[settingStyles.label, danger && settingStyles.dangerLabel]}>
          {label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const settingStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md - 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  label: { ...typography.body, color: colors.text },
  dangerLabel: { color: colors.error },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...typography.body, color: colors.textSecondary },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentMuted,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.h1, color: colors.accent },
  name: { ...typography.h2, color: colors.text },
  goalLabel: { ...typography.body, color: colors.textSecondary },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  tierBadgePremium: {
    backgroundColor: colors.goldMuted,
    borderColor: colors.gold,
  },
  tierBadgeText: { ...typography.caption, color: colors.textSecondary, fontWeight: '800', letterSpacing: 0.8 },
  tierBadgeTextPremium: { color: colors.gold },
  premiumBannerLeft: { flex: 1, paddingRight: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
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
  premiumBanner: {
    backgroundColor: colors.gold,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.gold,
  },
  premiumTitle: { ...typography.h4, color: colors.background, marginBottom: 2 },
  premiumSub: { ...typography.bodySmall, color: colors.background, opacity: 0.8 },
  version: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
