import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { UserProvider } from '@/src/contexts/UserContext';
import { colors } from '@/src/theme';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 500, fade: true });

// Web sitesi yalnızca tanıtım (showroom) + /admin panelidir.
// Kayıt/giriş, onboarding, program/antrenman ve premium akışları SADECE
// mobil uygulamada çalışır — web'de bu rotalara girilirse ana sayfaya döner.
const CUSTOMER_APP_ENABLED = Platform.OS !== 'web';

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <UserProvider>
      <StatusBar style="light" backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="admin" options={{ animation: 'slide_from_right' }} />

        <Stack.Protected guard={CUSTOMER_APP_ENABLED}>
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="auth/forgot-password" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="setup" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="program/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="program/create" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="workout/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="workout/player" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="exercise/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="premium" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
        </Stack.Protected>
      </Stack>
    </UserProvider>
  );
}
