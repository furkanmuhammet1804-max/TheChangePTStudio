import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  View,
} from 'react-native';
import { useUser } from '@/src/contexts/UserContext';
import { colors, spacing, typography } from '@/src/theme';

const { width } = Dimensions.get('window');

export default function SplashAnimationScreen() {
  const { isOnboardingComplete, loading } = useUser();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) return;

    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      if (isOnboardingComplete) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }, 2400);

    return () => clearTimeout(timeout);
  }, [loading, isOnboardingComplete]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Değişim bugün başlar.
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  logo: {
    width: width * 0.7,
    height: 120,
  },
  tagline: {
    ...typography.body,
    color: colors.textMuted,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
});
