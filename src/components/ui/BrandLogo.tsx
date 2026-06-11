/**
 * Resmi marka logosu — The Change PT Studio.
 *
 * Logo tüm yüzeylerde (mobil, web, admin, iOS, Android) bu bileşenle
 * gösterilir; böylece oran, kalite ve marka dili her yerde aynı kalır.
 *
 * Boyutlandırma kuralları:
 *  - `height` VEYA `width` verilir; diğer kenar orijinal orandan hesaplanır.
 *    Logo hiçbir koşulda stretch edilmez / kırpılmaz.
 *  - Kaynak görsel 917×348'dir; bulanıklık olmaması için logical genişlik
 *    ~458px'i (retina 2x sınırı) aşılmamalıdır — bileşen bunu otomatik sınırlar.
 */
import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

/** assets/images/logo.png gerçek oranı (917×348) */
export const LOGO_ASPECT_RATIO = 917 / 348;

/** Retina (2x) ekranlarda bulanıklık olmadan gösterilebilecek azami logical genişlik */
const MAX_SHARP_WIDTH = 917 / 2;

interface BrandLogoProps {
  /** Logo yüksekliği (dp) — genişlik orandan türetilir */
  height?: number;
  /** Logo genişliği (dp) — verilirse height yok sayılır, yükseklik orandan türetilir */
  width?: number;
  style?: StyleProp<ImageStyle>;
}

export function BrandLogo({ height = 32, width, style }: BrandLogoProps) {
  let w = width ?? height * LOGO_ASPECT_RATIO;
  if (w > MAX_SHARP_WIDTH) w = MAX_SHARP_WIDTH; // upscale = bulanıklık; izin verme
  const h = w / LOGO_ASPECT_RATIO;

  return (
    <Image
      source={require('@/assets/images/logo.png')}
      style={[{ height: h, width: w }, style]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="The Change PT Studio"
    />
  );
}
