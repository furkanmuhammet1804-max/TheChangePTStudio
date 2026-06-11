/**
 * Müşteri kayıt ekranı — yalnızca CANLI modda (Supabase) kullanılır.
 * Başarılı kayıtta (e-posta doğrulaması kapalıysa) oturum otomatik açılır
 * ve kullanıcı onboarding akışına yönlendirilir.
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
import { getAuthState, signUp } from '@/src/services/authService';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [info, setInfo]         = useState('');
  const [busy, setBusy]         = useState(false);

  const handleRegister = async () => {
    if (busy) return;
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Tüm alanları doldurun.');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.');
      return;
    }
    setBusy(true);
    setError('');
    setInfo('');
    const result = await signUp(email, password, fullName);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'Kayıt başarısız.');
      return;
    }
    // E-posta doğrulaması kapalıysa oturum hemen açılır; açıksa bilgi göster
    if (getAuthState().account) {
      router.replace('/');
    } else {
      setInfo('Hesabın oluşturuldu! E-postana gelen doğrulama bağlantısına tıkladıktan sonra giriş yapabilirsin.');
    }
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
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Kayıt Ol</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Ad Soyad</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Adın Soyadın"
                placeholderTextColor={colors.textMuted}
                autoComplete="name"
              />
            </View>

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
                placeholder="En az 6 karakter"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
                onSubmitEditing={handleRegister}
              />
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            {!!info && (
              <View style={styles.infoBox}>
                <Ionicons name="mail-unread-outline" size={14} color={colors.accent} />
                <Text style={styles.infoText}>{info}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister} activeOpacity={0.85}>
              {busy ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                <Text style={styles.primaryLabel}>Hesap Oluştur</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten hesabın var mı?</Text>
            <TouchableOpacity onPress={() => router.replace('/auth/login')} activeOpacity={0.8}>
              <Text style={styles.footerLink}>Giriş Yap</Text>
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
  brand: { alignItems: 'center' },

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
    marginTop: spacing.xs,
    ...shadows.accent,
  },
  primaryLabel: {
    ...typography.bodySmall,
    color: colors.background,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  footerText: { ...typography.bodySmall, color: colors.textMuted },
  footerLink: { ...typography.bodySmall, color: colors.accent, fontWeight: '800' },
});
