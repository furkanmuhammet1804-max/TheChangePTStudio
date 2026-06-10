import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandLogo } from '@/src/components/ui/BrandLogo';
import { Button } from '@/src/components/ui/Button';
import { useUser } from '@/src/contexts/UserContext';
import { ONBOARDING_SLIDES } from '@/src/constants/strings';
import { borderRadius, colors, gradients, spacing, typography } from '@/src/theme';

const { width } = Dimensions.get('window');

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface SlideVisual {
  icon: IconName;
  glow: readonly string[];
  tint: string;
}

// Each slide gets a distinct premium illustration treatment.
const SLIDE_VISUALS: SlideVisual[] = [
  { icon: 'flash',       glow: gradients.slideLime, tint: colors.accent },
  { icon: 'barbell',     glow: gradients.slideGold, tint: colors.gold },
  { icon: 'trending-up', glow: gradients.slideBlue, tint: '#4FC3F7' },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useUser();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatRef = useRef<Animated.FlatList<(typeof ONBOARDING_SLIDES)[number]>>(null);

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
      {/* Top ambient glow tied to the active slide */}
      <LinearGradient
        colors={SLIDE_VISUALS[activeIndex].glow as [string, string]}
        style={styles.ambient}
        pointerEvents="none"
      />

      <View style={[styles.skipRow, { paddingTop: insets.top + spacing.sm }]}>
        {/* Marka kimliği — ilk slaytta küçük ve premium */}
        {activeIndex === 0 ? <BrandLogo height={22} /> : <View />}
        {!isLast ? (
          <TouchableOpacity onPress={handleStart} style={styles.skipBtn} hitSlop={12}>
            <Text style={styles.skipText}>Atla</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.skipBtn} />
        )}
      </View>

      <Animated.FlatList
        ref={flatRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: true,
            listener: (e: any) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              if (idx !== activeIndex) setActiveIndex(idx);
            },
          },
        )}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <Slide item={item} index={index} scrollX={scrollX} />
        )}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.dots}>
          {ONBOARDING_SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [6, 26, 6],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.35, 1, 0.35],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  { width: dotWidth, opacity, backgroundColor: i === activeIndex ? colors.accent : colors.textSecondary },
                ]}
              />
            );
          })}
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

function Slide({
  item,
  index,
  scrollX,
}: {
  item: (typeof ONBOARDING_SLIDES)[number];
  index: number;
  scrollX: Animated.Value;
}) {
  const visual = SLIDE_VISUALS[index];
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const imageScale = scrollX.interpolate({
    inputRange,
    outputRange: [0.6, 1, 0.6],
    extrapolate: 'clamp',
  });
  const imageOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });
  const textTranslate = scrollX.interpolate({
    inputRange,
    outputRange: [width * 0.18, 0, -width * 0.18],
    extrapolate: 'clamp',
  });
  const textOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.slide}>
      {/* Illustration */}
      <Animated.View
        style={[
          styles.illustration,
          { opacity: imageOpacity, transform: [{ scale: imageScale }] },
        ]}
      >
        <LinearGradient
          colors={visual.glow as [string, string]}
          style={styles.glowRing}
        />
        <View style={[styles.ringOuter, { borderColor: visual.tint + '22' }]}>
          <View style={[styles.ringInner, { borderColor: visual.tint + '33' }]}>
            <LinearGradient colors={gradients.surfaceRaised} style={styles.iconDisc}>
              <Ionicons name={visual.icon} size={68} color={visual.tint} />
            </LinearGradient>
          </View>
        </View>
      </Animated.View>

      {/* Copy */}
      <Animated.View
        style={[
          styles.copy,
          { opacity: textOpacity, transform: [{ translateX: textTranslate }] },
        ]}
      >
        <Text style={[styles.eyebrow, { color: visual.tint }]}>{item.eyebrow}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
}

const RING = Math.min(width * 0.62, 260);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  ambient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  skipRow: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipBtn: {
    padding: spacing.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
  skipText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  slide: {
    width,
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  illustration: {
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  glowRing: {
    position: 'absolute',
    width: RING,
    height: RING,
    borderRadius: RING / 2,
  },
  ringOuter: {
    width: RING * 0.82,
    height: RING * 0.82,
    borderRadius: (RING * 0.82) / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: RING * 0.6,
    height: RING * 0.6,
    borderRadius: (RING * 0.6) / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDisc: {
    width: RING * 0.44,
    height: RING * 0.44,
    borderRadius: (RING * 0.44) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  copy: {
    alignItems: 'center',
  },
  eyebrow: {
    ...typography.label,
    letterSpacing: 2,
    marginBottom: spacing.md,
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
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    height: 8,
  },
  dot: {
    height: 6,
    borderRadius: borderRadius.full,
  },
});
