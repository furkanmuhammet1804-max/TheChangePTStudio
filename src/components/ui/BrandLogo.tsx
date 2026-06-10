/**
 * Resmi marka logosu — The Change PT Studio.
 *
 * Logo tüm yüzeylerde (mobil, web, admin) bu bileşenle gösterilir;
 * böylece oran, kalite ve görünüm her yerde aynı kalır.
 * Yalnızca yükseklik verilir, genişlik orijinal orandan hesaplanır —
 * logo hiçbir koşulda stretch edilmez.
 */
import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

/** assets/images/logo.png gerçek oranı (917×348) */
export const LOGO_ASPECT_RATIO = 917 / 348;

interface BrandLogoProps {
  /** Logo yüksekliği (dp) — genişlik orandan türetilir */
  height?: number;
  style?: StyleProp<ImageStyle>;
}

export function BrandLogo({ height = 32, style }: BrandLogoProps) {
  return (
    <Image
      source={require('@/assets/images/logo.png')}
      style={[{ height, width: height * LOGO_ASPECT_RATIO }, style]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="The Change PT Studio"
    />
  );
}
