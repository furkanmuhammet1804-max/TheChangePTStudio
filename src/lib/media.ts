/**
 * Egzersiz medya yardımcıları.
 *
 * mediaStatus alanı açıkça set edilmemişse URL alanlarından türetilir.
 * İleride admin panelden video/GIF/görsel yüklendiğinde aynı öncelik
 * sırası geçerli olur: video > gif > görsel.
 */
import { Exercise, MediaStatus } from '@/src/types';

export function getMediaStatus(exercise: Exercise): MediaStatus {
  if (exercise.mediaStatus) return exercise.mediaStatus;
  if (exercise.videoUrl) return 'video_ready';
  if (exercise.gifUrl) return 'gif_ready';
  if (exercise.imageUrl) return 'image_ready';
  return 'missing';
}

/** Detay ekranında gösterilecek en iyi görsel kaynak (gif > görsel > thumbnail) */
export function getDisplayMediaUrl(exercise: Exercise): string | undefined {
  return exercise.gifUrl ?? exercise.imageUrl ?? exercise.thumbnailUrl;
}

/** Liste kartlarında gösterilecek küçük görsel */
export function getThumbnailUrl(exercise: Exercise): string | undefined {
  return exercise.thumbnailUrl ?? exercise.imageUrl;
}
