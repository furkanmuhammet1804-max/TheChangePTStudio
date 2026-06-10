/**
 * Uygulama varyantı: aynı kod tabanı iki ayrı uygulama olarak derlenir.
 *
 *  - customer → The Change PT Studio (son kullanıcı; admin rotaları kapalı)
 *  - admin    → The Change Admin (işletme sahibi; doğrudan admin paneline açılır)
 *
 * Varyant, app.config.js içinde APP_VARIANT ortam değişkeniyle belirlenir.
 */
import Constants from 'expo-constants';

export type AppVariant = 'customer' | 'admin';

export const APP_VARIANT: AppVariant =
  Constants.expoConfig?.extra?.appVariant === 'admin' ? 'admin' : 'customer';

export const isAdminApp = APP_VARIANT === 'admin';
