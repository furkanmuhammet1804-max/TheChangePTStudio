/**
 * Egzersiz medya seçme/yükleme servisi.
 *
 * Bugün: cihazdan/bilgisayardan dosya seçilir (expo-image-picker — web'de
 * dosya inputuna, mobilde galeriye düşer) ve YEREL uri olarak saklanır.
 * Yarın: storage (Firebase Storage / Supabase Storage / S3) bağlandığında
 * sadece `uploadMediaPlaceholder` gövdesi gerçek yüklemeye dönüşür ve uzak
 * URL döner; form/ekran kodu değişmez.
 */
import * as ImagePicker from 'expo-image-picker';
import { getMediaStatus } from '@/src/lib/media';

export { getMediaStatus };

export type MediaSlot = 'image' | 'gif' | 'video' | 'thumbnail';

export interface PickedMedia {
  uri: string;
  fileName?: string;
  /** Bayt cinsinden — picker sağlarsa */
  fileSize?: number;
  mimeType?: string;
}

export type PickResult =
  | { status: 'picked'; media: PickedMedia }
  | { status: 'cancelled' }
  | { status: 'invalid'; reason: string };

function toPickedMedia(asset: ImagePicker.ImagePickerAsset): PickedMedia {
  return {
    uri: asset.uri,
    fileName: asset.fileName ?? undefined,
    fileSize: asset.fileSize ?? undefined,
    mimeType: asset.mimeType ?? undefined,
  };
}

async function pick(mediaTypes: ImagePicker.MediaType[]): Promise<PickResult> {
  // Web'de izin gerekmez; native'de galeri izni iste
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { status: 'invalid', reason: 'Galeri erişim izni verilmedi.' };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes,
    allowsMultipleSelection: false,
    quality: 0.9,
  });
  if (result.canceled || result.assets.length === 0) return { status: 'cancelled' };
  return { status: 'picked', media: toPickedMedia(result.assets[0]) };
}

function isGif(media: PickedMedia): boolean {
  return (
    media.mimeType === 'image/gif' ||
    (media.fileName ?? media.uri).toLowerCase().includes('.gif')
  );
}

// ─── Slot bazlı seçiciler ────────────────────────────────────────────────────

export function pickImage(): Promise<PickResult> {
  return pick(['images']);
}

export async function pickGif(): Promise<PickResult> {
  const result = await pick(['images']);
  if (result.status === 'picked' && !isGif(result.media)) {
    return { status: 'invalid', reason: 'Lütfen .gif uzantılı bir dosya seç.' };
  }
  return result;
}

export function pickVideo(): Promise<PickResult> {
  return pick(['videos']);
}

export function pickThumbnail(): Promise<PickResult> {
  return pick(['images']);
}

export function pickForSlot(slot: MediaSlot): Promise<PickResult> {
  switch (slot) {
    case 'image':     return pickImage();
    case 'gif':       return pickGif();
    case 'video':     return pickVideo();
    case 'thumbnail': return pickThumbnail();
  }
}

// ─── Yükleme (placeholder) ───────────────────────────────────────────────────

/**
 * Gerçek storage bağlanana kadar yerel uri'yi aynen döner.
 * Storage bağlandığında: dosyayı yükle → kalıcı uzak URL döndür.
 */
export async function uploadMediaPlaceholder(media: PickedMedia): Promise<string> {
  return media.uri;
}

// ─── Görüntüleme yardımcıları ────────────────────────────────────────────────

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
