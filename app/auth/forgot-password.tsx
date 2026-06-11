/**
 * Şifre sıfırlama ekranı — Supabase sıfırlama e-postası gönderir.
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandLogo } from '@/src/components/ui/BrandLogo';
import { resetPassword } from '@/src/services/authService';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent]   = useState(false);
  const [busy, setBusy]   = useState(false);

  const handleReset = async () => {
    if (busy) return;
    if (!email.trim()) {
      setError('E-posta adresini gir.');
      return;
    }
    setBusy(true);
    setError('');
    const result = await resetPassword(email);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'İşlem başarısız.');
      return;
    }
    setSent(true);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.brand}>
        <BrandLogo width={220} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Şifremi Unuttum</Text>
        <Text style={styles.subtitle}>
          Hesabına bağlı e-posta adresini gir; sıfırlama bağlantısı gönderelim.
        </Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="ornek@eposta.com"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onSubmitEditing={handleReset}
        />

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {sent && (
          <View style={styles.infoBox}>
            <Ionicons name="mail-unread-outline" size={14} color={colors.accent} />
            <Text style={styles.infoText}>
              Sıfırlama bağlantısı gönderildi — gelen kutunu kontrol et.
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.primaryBtn} onPress={handleReset} activeOpacity={0.85}>
          {busy ? (
            <ActivityIndicator color={colors.background} size="small" />
          ) : (
            <Text style={styles.primaryLabel}>Sıfırlama Bağlantısı Gönder</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => router.replace('/auth/login')}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.linkText}>Girişe dön</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  brand: { alignItems: 'center' },

  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.md,
  },
  title: { ...typography.h3, color: colors.text },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },

  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },

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

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    backgroundColor: colors.accentMuted,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  infoText: { ...typography.caption, color: colors.text, flex: 1, lineHeight: 16 },

  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 6,
    ...shadows.accent,
  },
  primaryLabel: {
    ...typography.bodySmall,
    color: colors.background,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    paddingVertical: spacing.xs,
  },
  linkText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
});
