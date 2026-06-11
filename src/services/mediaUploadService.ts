/**
 * Egzersiz medya seçme/yükleme servisi.
 *
 * Dosya cihazdan/bilgisayardan seçilir (expo-image-picker — web'de dosya
 * inputuna, mobilde galeriye düşer).
 *
 * CANLI modda (.env'de Supabase tanımlı): dosya `exercise-media` bucket'ına
 * yüklenir ve kalıcı public URL döner — müşteri uygulaması medyayı bu URL'den
 * gösterir. YEREL modda: yerel uri aynen saklanır (test).
 */
import * as ImagePicker from 'expo-image-picker';
import { getMediaStatus } from '@/src/lib/media';
import { getSupabase, isSupabaseConfigured } from '@/src/lib/supabase';

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

// ─── Yükleme ─────────────────────────────────────────────────────────────────

/**
 * Canlı modda dosyayı Supabase Storage'a (exercise-media) yükler ve kalıcı
 * public URL döner. Yerel modda yerel uri'yi aynen döner.
 */
export async function uploadMediaPlaceholder(media: PickedMedia): Promise<string> {
  if (!isSupabaseConfigured()) return media.uri;

  const supabase = getSupabase();
  const response = await fetch(media.uri);
  const blob = await response.blob();

  const extFromName = (media.fileName ?? '').split('.').pop()?.toLowerCase();
  const extFromMime = (media.mimeType ?? blob.type).split('/')[1];
  const ext = (extFromName || extFromMime || 'bin').replace('jpeg', 'jpg');
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from('exercise-media')
    .upload(path, blob, { contentType: media.mimeType ?? blob.type ?? undefined });
  if (error) {
    console.warn('[mediaUpload] Storage yüklemesi başarısız, yerel uri kullanılıyor:', error);
    return media.uri;
  }

  return supabase.storage.from('exercise-media').getPublicUrl(path).data.publicUrl;
}

// ─── Görüntüleme yardımcıları ────────────────────────────────────────────────

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
