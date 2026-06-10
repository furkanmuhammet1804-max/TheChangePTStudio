/**
 * Geçici admin giriş ekranı — /admin rotası artık herkese açık değil.
 * Gerçek auth sistemi bağlandığında bu ekran kimlik sağlayıcısına bağlanır.
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormField } from '@/src/components/admin/forms';
import { BrandLogo } from '@/src/components/ui/BrandLogo';
import { isAdminApp } from '@/src/lib/appVariant';
import { loginAdmin } from '@/src/services/adminAuth';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';

export function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);

  const handleLogin = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    const ok = await loginAdmin(username, password);
    setBusy(false);
    if (!ok) setError('Kullanıcı adı veya şifre hatalı.');
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.card}>
        <View style={styles.brand}>
          <BrandLogo height={48} />
          <Text style={styles.brandSub}>YÖNETİM PANELİ</Text>
        </View>

        <FormField
          label="Kullanıcı Adı"
          value={username}
          onChangeText={setUsername}
          placeholder="thechange"
          autoCapitalize="none"
        />
        <FormField
          label="Şifre"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
        />

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.85}>
          {busy ? (
            <ActivityIndicator color={colors.background} size="small" />
          ) : (
            <>
              <Ionicons name="lock-open-outline" size={16} color={colors.background} />
              <Text style={styles.loginLabel}>Giriş Yap</Text>
            </>
          )}
        </TouchableOpacity>

        {!isAdminApp && (
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.backLabel}>Uygulamaya dön</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.footNote}>
        Yetkili girişi · Bu panel yalnızca işletme yönetimi içindir
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.md,
  },
  brand: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  brandSub: { ...typography.caption, color: colors.accent, letterSpacing: 2 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    backgroundColor: 'rgba(255,75,75,0.1)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,75,75,0.35)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorText: { ...typography.caption, color: colors.error, flex: 1 },

  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 6,
    marginTop: spacing.xs,
    ...shadows.accent,
  },
  loginLabel: { ...typography.bodySmall, color: colors.background, fontWeight: '800', letterSpacing: 0.5 },

  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    paddingVertical: spacing.xs,
  },
  backLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  footNote: { ...typography.caption, color: colors.textMuted },
});
