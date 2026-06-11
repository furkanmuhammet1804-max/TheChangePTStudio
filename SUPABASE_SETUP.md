# Supabase Kurulum Rehberi — The Change PT Studio

Müşteri uygulaması, The Change Admin (APK/iOS) ve web admin paneli **aynı
Supabase veritabanı** üzerinden eşzamanlı çalışır. Bu rehber sıfırdan canlıya
alma adımlarını anlatır. Süre: ~15 dakika.

> **.env doldurulmadan** uygulama YEREL modda çalışır (cihaz içi test verisi,
> geçici admin girişi `thechange/0000` sadece geliştirmede). .env dolunca tüm
> uygulamalar otomatik CANLI moda geçer.

---

## 1. Supabase projesi aç

1. https://supabase.com → **Start your project** → GitHub/e-posta ile giriş yap (ücretsiz).
2. **New project** → isim: `the-change-pt-studio`, bölge: **EU (Frankfurt)** (Türkiye'ye en yakın), güçlü bir veritabanı şifresi belirle (not al).
3. Proje açılınca (1-2 dk) hazır.

## 2. URL ve anahtarı .env'e yaz

1. Dashboard → **Project Settings** (dişli) → **API**.
2. Şu iki değeri kopyala:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon / public** anahtarı → `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. Proje kökündeki `.env` dosyasına yapıştır:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> ⚠️ `service_role` anahtarını ASLA .env'e veya koda koymayın — o anahtar
> tüm güvenlik kurallarını (RLS) atlar, sadece sunucu tarafında kullanılır.

EAS bulut build'lerinin de bu değerleri görmesi için (mağaza sürümleri):

```bash
npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxxx.supabase.co" --environment production
npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..." --environment production
```
(Her iki EAS projesi için de: komutları hem `the-change-pt-studio` hem
`the-change-admin` proje dizin bağlamında çalıştırın — `APP_VARIANT=admin`
ile bir kez daha.)

## 3. SQL migration'larını çalıştır

1. Dashboard → **SQL Editor** → **New query**.
2. `supabase/migrations/0001_initial_schema.sql` dosyasının TAMAMINI yapıştır → **Run**.
   - Tablolar, güvenlik kuralları (RLS), auth trigger'ı, storage bucket'ları ve realtime yayını kurulur.
3. Yeni query → `supabase/migrations/0002_seed_catalog.sql` → **Run**.
   - Mevcut egzersiz/program kataloğu (34 egzersiz, 5 program) veritabanına yüklenir.

> Katalog verisi `src/data` değiştiğinde `node scripts/generate-seed-sql.js`
> ile seed dosyasını yeniden üretebilirsiniz.

## 4. Storage bucket'larını doğrula

Dashboard → **Storage**: `exercise-media` (public), `transformation-photos`
(private), `app-assets` (public) bucket'ları migration ile otomatik oluşur.
Görünüyorlarsa ek işlem gerekmez.

## 5. Admin kullanıcı oluştur

1. Dashboard → **Authentication** → **Users** → **Add user** → **Create new user**.
   - E-posta: `admin@thechangept.com` (kendi adresin), şifre belirle.
   - **Auto Confirm User** işaretli olsun.
2. SQL Editor'de şunu çalıştır (e-postayı kendi adresinle değiştir):

```sql
update public.users set role = 'admin' where email = 'admin@thechangept.com';
```

3. Artık The Change Admin uygulamasına ve web panele bu e-posta/şifre ile
   girilir. `role = 'admin'` olmayan hesaplar — şifreleri doğru olsa bile —
   panele giremez.

## 6. Auth ayarları (önerilen)

Dashboard → **Authentication** → **Sign In / Up**:

- **Email** sağlayıcısı açık olsun (varsayılan açık).
- İlk testlerde **Confirm email** kapatılabilir (kayıt sonrası anında giriş);
  canlıda açık tutmanız önerilir.

## 7. Test senaryosu (uçtan uca)

| Adım | Nerede | Beklenen |
|---|---|---|
| 1. Yeni hesap kaydı + profil oluştur | Müşteri uygulaması | Kayıt sonrası onboarding açılır |
| 2. Admin girişi → Kullanıcılar | Web panel / Admin APK | Yeni kullanıcı listede görünür |
| 3. Kullanıcıyı premium yap | Admin panel | Müşteri uygulamasında premium alanlar **anında** açılır (realtime) |
| 4. Program ata | Admin panel | Müşteri uygulamasında atanan program görünür |
| 5. Yeni egzersiz ekle + medya yükle | Admin panel | Medya Storage'a yüklenir; egzersiz müşteri kütüphanesinde görünür |
| 6. Müşteri favori ekler / antrenman tamamlar | Müşteri uygulaması | Admin panelde kullanıcı detayında istatistik görünür |

## Mimari özet

```
Müşteri uygulaması (iOS/Android)  ┐
The Change Admin (iOS/Android)    ├──► Supabase (Auth + Postgres + Storage + Realtime)
Web admin paneli (Vercel)         ┘         │
                                            └── RLS: yetkiler veritabanında
```

- **Auth**: Supabase Auth (e-posta/şifre). Kayıt trigger'ı `public.users` +
  `public.profiles` satırlarını otomatik açar; rol varsayılan `customer`.
- **Veri**: ekran kodu değişmez — `appStore` canlı modda Supabase'ten beslenir,
  yazma işlemleri anında Supabase'e gider, realtime tüm cihazlara dağıtır.
- **Medya**: admin yüklemeleri `exercise-media` (public URL), kullanıcı
  fotoğrafları `transformation-photos` (kişiye özel, imzalı URL).
- **Güvenlik (RLS)**: kullanıcı yalnızca kendi profil/log/fotoğraflarını görür;
  yayınlanmış içerik herkese açık; içerik/üyelik yönetimi yalnızca admin.
- **Ödeme**: şimdilik admin manuel premium verir veya uygulama içi test satın
  alma `memberships`'e `app_store/google_play` kaynaklı kayıt açar. RevenueCat
  bağlandığında aynı tablo yapısı kullanılacak.
- **Yerel fallback**: .env boşsa uygulama bugünkü gibi cihaz-yerel çalışır.
