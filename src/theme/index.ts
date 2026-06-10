export const colors = {
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceSecondary: '#242424',
  surfaceTertiary: '#2E2E2E',

  accent: '#C5F135',
  accentDark: '#9ABC28',
  accentMuted: 'rgba(197, 241, 53, 0.15)',
  accentSoft: 'rgba(197, 241, 53, 0.08)',

  gold: '#D4A843',
  goldLight: '#E4C16B',
  goldMuted: 'rgba(212, 168, 67, 0.15)',

  text: '#FFFFFF',
  textSecondary: '#8A8A8A',
  textMuted: '#555555',

  border: '#2A2A2A',
  borderLight: '#363636',

  success: '#4CAF50',
  error: '#FF4B4B',
  warning: '#FFA726',

  overlay: 'rgba(0,0,0,0.6)',
  overlayStrong: 'rgba(0,0,0,0.85)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

export const typography = {
  hero: {
    fontSize: 44,
    fontWeight: '900' as const,
    letterSpacing: -2,
    lineHeight: 48,
  },
  h1: {
    fontSize: 34,
    fontWeight: '800' as const,
    letterSpacing: -1.5,
    lineHeight: 38,
  },
  h2: {
    fontSize: 26,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
    lineHeight: 30,
  },
  h3: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  h4: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
    lineHeight: 16,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.4,
    lineHeight: 14,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  accent: {
    shadowColor: '#C5F135',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  gold: {
    shadowColor: '#D4A843',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

/**
 * Reusable gradient color tuples for <LinearGradient>.
 * Use as: colors={gradients.accent} (typed as readonly string[]).
 */
export const gradients = {
  accent: ['#D4FF4F', '#C5F135', '#9ABC28'] as const,
  gold: ['#E4C16B', '#D4A843'] as const,
  // Subtle dark card sheen — top slightly lifted, bottom into background
  surface: ['#222222', '#161616'] as const,
  surfaceRaised: ['#272727', '#1A1A1A'] as const,
  // Hero / illustration backdrops
  heroDark: ['#1F1F1F', '#101010'] as const,
  // Per-onboarding-slide accent glows
  slideLime: ['rgba(197,241,53,0.22)', 'rgba(197,241,53,0.02)'] as const,
  slideGold: ['rgba(212,168,67,0.22)', 'rgba(212,168,67,0.02)'] as const,
  slideBlue: ['rgba(79,195,247,0.22)', 'rgba(79,195,247,0.02)'] as const,
} as const;
