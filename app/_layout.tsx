import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { UserProvider } from '@/src/contexts/UserContext';
import { colors } from '@/src/theme';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 500, fade: true });

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
        <Stack.Screen name="admin" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </UserProvider>
  );
}
