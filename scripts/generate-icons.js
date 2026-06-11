/**
 * Resmi marka ikonlarından APK varyant görsellerini üretir.
 *
 * Kaynaklar (elle sağlanır, üzerine yazılmaz):
 *   assets/images/müşteri-uygulama-icon.png  → müşteri uygulaması
 *   assets/images/admin-uygulama-ikon.png    → admin uygulaması
 *
 * Üretilenler (bu script'i çalıştırarak yeniden oluşturulur):
 *   musteri-uygulama-adaptive-icon.png / admin-uygulama-adaptive-icon.png
 *     1024×1024 adaptive icon foreground — logo, Android'in dairesel maske
 *     güvenli alanına (iç %61) sığacak şekilde ölçeklenip ortalanır.
 *   musteri-uygulama-monochrome-icon.png / admin-uygulama-monochrome-icon.png
 *     Android 13+ temalı ikon için beyaz siluet (alfa = parlaklık).
 *   musteri-uygulama-splash-icon.png / admin-uygulama-splash-icon.png
 *     Logo sınır kutusu + %10 pay; orijinal çözünürlük korunur (upscale yok).
 *
 * Çalıştırma: node scripts/generate-icons.js
 */
const path = require('path');
const Jimp = require('jimp-compact');

const IMAGES_DIR = path.join(__dirname, '..', 'assets', 'images');

const CANVAS_SIZE = 1024;
// Adaptive icon: 108dp tuval, 66dp güvenli alan → logonun köşegeni %61'i aşmamalı
const SAFE_DIAMETER = Math.round(CANVAS_SIZE * (66 / 108));
const BLACK = 0x000000ff;
const TRANSPARENT = 0x00000000;
const LUMINANCE_THRESHOLD = 20;

async function processVariant(sourceFile, outPrefix) {
  const src = await Jimp.read(path.join(IMAGES_DIR, sourceFile));
  const { width: W, height: H } = src.bitmap;

  // Logo sınır kutusunu bul (siyah olmayan pikseller)
  let minX = W, minY = H, maxX = -1, maxY = -1;
  src.scan(0, 0, W, H, function (x, y, idx) {
    const d = this.bitmap.data;
    if (d[idx] > LUMINANCE_THRESHOLD || d[idx + 1] > LUMINANCE_THRESHOLD || d[idx + 2] > LUMINANCE_THRESHOLD) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  });
  if (maxX < 0) throw new Error(`${sourceFile}: logo bulunamadı (görsel tamamen siyah)`);

  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  const logo = src.clone().crop(minX, minY, bw, bh);

  // --- Adaptive icon foreground ---
  const diagonal = Math.sqrt(bw * bw + bh * bh);
  const scale = Math.min(1, SAFE_DIAMETER / diagonal); // asla büyütme → kalite kaybı olmaz
  const lw = Math.round(bw * scale);
  const lh = Math.round(bh * scale);
  const scaledLogo = logo.clone().resize(lw, lh);
  const offsetX = Math.round((CANVAS_SIZE - lw) / 2);
  const offsetY = Math.round((CANVAS_SIZE - lh) / 2);

  const foreground = new Jimp(CANVAS_SIZE, CANVAS_SIZE, BLACK);
  foreground.composite(scaledLogo, offsetX, offsetY);
  await foreground.writeAsync(path.join(IMAGES_DIR, `${outPrefix}-adaptive-icon.png`));

  // --- Monokrom ikon (Android 13+ temalı ikonlar) ---
  const silhouette = scaledLogo.clone();
  silhouette.scan(0, 0, lw, lh, function (x, y, idx) {
    const d = this.bitmap.data;
    const lum = 0.299 * d[idx] + 0.587 * d[idx + 1] + 0.114 * d[idx + 2];
    d[idx] = 255;
    d[idx + 1] = 255;
    d[idx + 2] = 255;
    d[idx + 3] = Math.min(255, Math.round(lum * 2));
  });
  const monochrome = new Jimp(CANVAS_SIZE, CANVAS_SIZE, TRANSPARENT);
  monochrome.composite(silhouette, offsetX, offsetY);
  await monochrome.writeAsync(path.join(IMAGES_DIR, `${outPrefix}-monochrome-icon.png`));

  // --- Splash ikonu (orijinal çözünürlük, %10 pay) ---
  const pad = Math.round(Math.max(bw, bh) * 0.1);
  const splash = new Jimp(bw + pad * 2, bh + pad * 2, BLACK);
  splash.composite(logo, pad, pad);
  await splash.writeAsync(path.join(IMAGES_DIR, `${outPrefix}-splash-icon.png`));

  console.log(
    `${sourceFile} → ${outPrefix}-*  (logo ${bw}x${bh}, adaptive ölçek ${(scale * 100).toFixed(1)}%)`
  );
}

(async () => {
  await processVariant('müşteri-uygulama-icon.png', 'musteri-uygulama');
  await processVariant('admin-uygulama-ikon.png', 'admin-uygulama');
  console.log('Tüm varyant görselleri üretildi.');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
