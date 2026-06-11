/**
 * Dinamik Expo yapılandırması — tek kod tabanından İKİ ayrı resmi mağaza
 * uygulaması üretir (App Store + Google Play):
 *
 *   Müşteri : "The Change PT Studio" → com.thechange.ptstudio       (slug: the-change-pt-studio)
 *   Admin   : "The Change Admin"     → com.thechange.ptstudio.admin (slug: the-change-admin)
 *
 * Admin varyantı APP_VARIANT=admin ortam değişkeniyle seçilir:
 *   npm run start:admin                              (geliştirme)
 *   eas build --profile admin-android-production     (Google Play AAB)
 *   eas build --profile admin-ios-production         (App Store / TestFlight)
 *
 * Her varyantın kendi EAS projesi, ikonu, adaptive/monochrome ikonu ve splash
 * görseli vardır. Türetilmiş görseller: node scripts/generate-icons.js
 *
 * extra.appVariant değeri runtime'da src/lib/appVariant.ts üzerinden okunur;
 * müşteri uygulamasında admin rotaları tamamen kapatılır.
 */
const appJson = require('./app.json');

const IS_ADMIN = process.env.APP_VARIANT === 'admin';

const VARIANTS = {
  customer: {
    name: 'The Change PT Studio',
    slug: 'the-change-pt-studio',
    scheme: 'thechangeptstudio',
    bundleId: 'com.thechange.ptstudio',
    icon: './assets/images/müşteri-uygulama-icon.png',
    adaptiveIcon: './assets/images/musteri-uygulama-adaptive-icon.png',
    monochromeIcon: './assets/images/musteri-uygulama-monochrome-icon.png',
    splashIcon: './assets/images/musteri-uygulama-splash-icon.png',
    easProjectId: '88cb3db6-f971-4c1f-92f0-cd1f5827277b', // @furkanssenn/the-change-pt-studio
  },
  admin: {
    name: 'The Change Admin',
    slug: 'the-change-admin',
    scheme: 'thechangeadmin',
    bundleId: 'com.thechange.ptstudio.admin',
    icon: './assets/images/admin-uygulama-ikon.png',
    adaptiveIcon: './assets/images/admin-uygulama-adaptive-icon.png',
    monochromeIcon: './assets/images/admin-uygulama-monochrome-icon.png',
    splashIcon: './assets/images/admin-uygulama-splash-icon.png',
    easProjectId: '8fe9f8ef-3a2a-466c-a247-811847eeeab9', // @furkanssenn/the-change-admin
  },
};

module.exports = () => {
  const base = appJson.expo;
  const variant = IS_ADMIN ? VARIANTS.admin : VARIANTS.customer;

  return {
    ...base,
    name: variant.name,
    slug: variant.slug,
    scheme: variant.scheme,
    icon: variant.icon,
    ios: { ...base.ios, bundleIdentifier: variant.bundleId },
    android: {
      ...base.android,
      package: variant.bundleId,
      adaptiveIcon: {
        ...base.android.adaptiveIcon,
        foregroundImage: variant.adaptiveIcon,
        monochromeImage: variant.monochromeIcon,
      },
    },
    plugins: base.plugins.map((plugin) => {
      if (Array.isArray(plugin) && plugin[0] === 'expo-splash-screen') {
        return [plugin[0], { ...plugin[1], image: variant.splashIcon }];
      }
      return plugin;
    }),
    extra: {
      ...base.extra,
      appVariant: IS_ADMIN ? 'admin' : 'customer',
      eas: { projectId: variant.easProjectId },
    },
  };
};
