/**
 * Müşteri giriş ekranı — yalnızca CANLI modda (Supabase) kullanılır.
 * Yerel modda bu rotaya yönlendirme yapılmaz (app/index.tsx karar verir).
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandLogo } from '@/src/components/ui/BrandLogo';
import { signIn } from '@/src/services/authService';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);

  const handleLogin = async () => {
    if (busy) return;
    if (!email.trim() || !password) {
      setError('E-posta ve şifre girin.');
      return;
    }
    setBusy(true);
    setError('');
    const result = await signIn(email, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'Giriş başarısız.');
      return;
    }
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <BrandLogo width={250} />
            <Text style={styles.tagline}>Değişim bugün başlar.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Giriş Yap</Text>

            <View style={styles.field}>
              <Text style={styles.label}>E-posta</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="ornek@eposta.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Şifre</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
                onSubmitEditing={handleLogin}
              />
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} activeOpacity={0.85}>
              {busy ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                <Text style={styles.primaryLabel}>Giriş Yap</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => router.push('/auth/forgot-password')}
              activeOpacity={0.8}
            >
              <Text style={styles.linkText}>Şifremi unuttum</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Hesabın yok mu?</Text>
            <TouchableOpacity onPress={() => router.replace('/auth/register')} activeOpacity={0.8}>
              <Text style={styles.footerLink}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  brand: { alignItems: 'center', gap: spacing.md },
  tagline: { ...typography.body, color: colors.textMuted, fontStyle: 'italic' },

  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.md,
  },
  title: { ...typography.h3, color: colors.text },

  field: { gap: spacing.xs + 2 },
  label: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '600' },
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

  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 6,
    marginTop: spacing.xs,
    ...shadows.accent,
  },
  primaryLabel: {
    ...typography.bodySmall,
    color: colors.background,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  linkBtn: { alignItems: 'center', paddingVertical: spacing.xs },
  linkText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  footerText: { ...typography.bodySmall, color: colors.textMuted },
  footerLink: { ...typography.bodySmall, color: colors.accent, fontWeight: '800' },
});
