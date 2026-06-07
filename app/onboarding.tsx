import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { useUser } from '@/src/contexts/UserContext';
import { ONBOARDING_SLIDES } from '@/src/constants/strings';
import { borderRadius, colors, spacing, typography } from '@/src/theme';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { completeOnboarding } = useUser();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const onViewRef = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) setActiveIndex(viewableItems[0].index ?? 0);
    },
  );

  const handleNext = () => {
    if (activeIndex < ONBOARDING_SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      handleStart();
    }
  };

  const handleStart = async () => {
    await completeOnboarding();
    router.replace('/setup');
  };

  const isLast = activeIndex === ONBOARDING_SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <View style={styles.skipRow}>
        {!isLast && (
          <TouchableOpacity onPress={handleStart} style={styles.skipBtn}>
            <Text style={styles.skipText}>Atla</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.imageContainer}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {ONBOARDING_SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>

        <Button
          title={isLast ? 'BAŞLAYALIM' : 'DEVAM'}
          onPress={handleNext}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipRow: {
    paddingTop: 64,
    paddingHorizontal: spacing.lg,
    alignItems: 'flex-end',
    minHeight: 92,
  },
  skipBtn: {
    padding: spacing.sm,
  },
  skipText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  slide: {
    width,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingBottom: spacing.xxl,
  },
  imageContainer: {
    width: width * 0.6,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 48,
    gap: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceTertiary,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.accent,
  },
});
