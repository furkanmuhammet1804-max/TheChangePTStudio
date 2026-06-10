/**
 * Dinamik Expo yapılandırması — tek kod tabanından İKİ ayrı uygulama üretir:
 *
 *   Müşteri APK : "The Change PT Studio"  → com.thechange.ptstudio
 *   Admin APK   : "The Change Admin"      → com.thechange.ptstudio.admin
 *
 * Admin varyantı APP_VARIANT=admin ortam değişkeniyle seçilir:
 *   npm run start:admin           (geliştirme)
 *   eas build --profile admin-apk (üretim APK — eas.json)
 *
 * extra.appVariant değeri runtime'da src/lib/appVariant.ts üzerinden okunur;
 * müşteri uygulamasında admin rotaları tamamen kapatılır.
 */
const appJson = require('./app.json');

const IS_ADMIN = process.env.APP_VARIANT === 'admin';

module.exports = () => {
  const base = appJson.expo;

  if (!IS_ADMIN) {
    return {
      ...base,
      ios: { ...base.ios, bundleIdentifier: 'com.thechange.ptstudio' },
      android: { ...base.android, package: 'com.thechange.ptstudio' },
      extra: { ...base.extra, appVariant: 'customer' },
    };
  }

  return {
    ...base,
    name: 'The Change Admin',
    scheme: 'thechangeadmin',
    ios: { ...base.ios, bundleIdentifier: 'com.thechange.ptstudio.admin' },
    android: { ...base.android, package: 'com.thechange.ptstudio.admin' },
    extra: { ...base.extra, appVariant: 'admin' },
  };
};
