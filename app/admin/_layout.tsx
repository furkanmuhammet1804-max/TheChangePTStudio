import { Redirect, Slot } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { AdminLogin } from '@/src/components/admin/AdminLogin';
import { AdminShell } from '@/src/components/admin/AdminShell';
import { isAdminApp } from '@/src/lib/appVariant';
import { initAdminAuth, useAdminAuth } from '@/src/services/adminAuth';
import { initAppStore, useAppState } from '@/src/services/appStore';
import { colors } from '@/src/theme';

export default function AdminLayout() {
  const { ready, authenticated } = useAdminAuth();
  const storeReady = useAppState((s) => s.ready);

  useEffect(() => {
    initAdminAuth();
    initAppStore();
  }, []);

  // Müşteri uygulamasında (native) admin rotaları tamamen kapalı —
  // yönetim paneli yalnızca ayrı Admin APK'sında ve web panel URL'inde çalışır.
  if (!isAdminApp && Platform.OS !== 'web') {
    return <Redirect href="/" />;
  }

  if (!ready || !storeReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!authenticated) return <AdminLogin />;

  return (
    <AdminShell>
      <Slot />
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
