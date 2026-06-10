import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { useUser } from '@/src/contexts/UserContext';
import {
  DIFFICULTY_LABELS,
  ENVIRONMENT_LABELS,
  EQUIPMENT_LABELS,
  MUSCLE_LABELS,
} from '@/src/constants/strings';
import { findExerciseById } from '@/src/services/appStore';
import { getDisplayMediaUrl, getMediaStatus } from '@/src/lib/media';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';
import { Exercise } from '@/src/types';
import { hapticConfirm } from '@/src/utils/haptics';

/**
 * Egzersiz medyası — öncelik sırası: video > GIF > görsel.
 * Hiçbiri yoksa premium görünümlü "Medya hazırlanıyor" placeholder'ı gösterir.
 */
function ExerciseMedia({ exercise }: { exercise: Exercise }) {
  const status = getMediaStatus(exercise);
  const displayUrl = getDisplayMediaUrl(exercise);

  const player = useVideoPlayer(exercise.videoUrl ?? null, (p) => {
    p.loop = true;
    p.muted = true;
  });

  if (status === 'video_ready' && exercise.videoUrl) {
    return (
      <View style={mediaStyles.mediaBox}>
        <VideoView
          player={player}
          style={mediaStyles.mediaImage}
          contentFit="cover"
          nativeControls
        />
      </View>
    );
  }

  if (displayUrl) {
    return (
      <View style={mediaStyles.mediaBox}>
        <Image
          source={{ uri: displayUrl }}
          style={mediaStyles.mediaImage}
          contentFit="cover"
          transition={200}
          accessibilityLabel={`${exercise.name} hareket görseli`}
        />
        {status === 'gif_ready' && (
          <View style={mediaStyles.videoBadge}>
            <Ionicons name="film-outline" size={14} color={colors.accent} />
            <Text style={mediaStyles.videoBadgeText}>GIF</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={mediaStyles.placeholder}>
      <View style={mediaStyles.placeholderIcon}>
        <Ionicons name="videocam-outline" size={32} color={colors.accent} />
      </View>
      <Text style={mediaStyles.placeholderTitle}>Medya hazırlanıyor</Text>
      <Text style={mediaStyles.placeholderText}>
        Bu hareketin video ve görsel içeriği stüdyo tarafından hazırlanıyor
      </Text>
    </View>
  );
}

const mediaStyles = StyleSheet.create({
  mediaBox: {
    height: 220,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaImage: { flex: 1 },
  videoBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.overlayStrong,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  videoBadgeText: { ...typography.caption, color: colors.accent },
  placeholder: {
    height: 220,
    backgroundColor: colors.surfaceSecondary,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  placeholderTitle: { ...typography.h4, color: colors.text },
  placeholderText: { ...typography.bodySmall, color: colors.textMuted },
});

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = findExerciseById(id ?? '');
  const { isFavoriteExercise, toggleFavoriteExercise } = useUser();
  const [activeTab, setActiveTab] = useState<'howto' | 'tips' | 'mistakes'>('howto');

  if (!exercise) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Egzersiz bulunamadı.</Text>
          <Button title="Geri Dön" onPress={() => router.back()} variant="ghost" />
        </View>
      </SafeAreaView>
    );
  }

  const alternatives = exercise.alternatives
    .map((altId) => findExerciseById(altId))
    .filter(Boolean);

  const isFav = isFavoriteExercise(exercise.id);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
          <Text style={styles.backLabel}>Egzersizler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.favBtn, isFav && styles.favBtnActive]}
          onPress={() => {
            hapticConfirm();
            toggleFavoriteExercise(exercise.id);
          }}
          activeOpacity={0.7}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isFav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          accessibilityState={{ selected: isFav }}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={22}
            color={isFav ? colors.error : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Media: image / GIF / video for proper form */}
        <ExerciseMedia exercise={exercise} />

        {/* Title & Tags */}
        <View style={styles.header}>
          <Text style={styles.title}>{exercise.name}</Text>
          <View style={styles.tagRow}>
            <Badge label={MUSCLE_LABELS[exercise.muscleGroup]} variant="accent" />
            <Badge label={DIFFICULTY_LABELS[exercise.difficulty]} variant="surface" />
            <Badge label={EQUIPMENT_LABELS[exercise.equipment]} variant="surface" />
          </View>
          <View style={styles.tagRow}>
            {exercise.environments.map((env) => (
              <View key={env} style={styles.envChip}>
                <Ionicons
                  name={
                    env === 'home' ? 'home-outline'
                    : env === 'gym' ? 'barbell-outline'
                    : env === 'travel' ? 'airplane-outline'
                    : 'sunny-outline'
                  }
                  size={12}
                  color={colors.textSecondary}
                />
                <Text style={styles.envChipText}>{ENVIRONMENT_LABELS[env]}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.description}>{exercise.description}</Text>
        </View>

        {/* Set/Rep Info */}
        {exercise.sets && (
          <View style={styles.metaRow}>
            <MetaBox label="Set" value={String(exercise.sets)} />
            <MetaBox label="Tekrar" value={exercise.reps ?? '—'} accent />
            <MetaBox label="Dinlenme" value={`${exercise.rest ?? 60}sn`} />
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabRow}>
          {([
            { key: 'howto', label: 'Nasıl Yapılır?' },
            { key: 'tips', label: 'İpuçları' },
            { key: 'mistakes', label: 'Hatalar' },
          ] as const).map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'howto' && exercise.howTo.map((step, i) => (
            <View key={i} style={styles.listItem}>
              <View style={styles.listNumber}>
                <Text style={styles.listNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.listText}>{step}</Text>
            </View>
          ))}

          {activeTab === 'tips' && exercise.tips.map((tip, i) => (
            <View key={i} style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
              <Text style={styles.listText}>{tip}</Text>
            </View>
          ))}

          {activeTab === 'mistakes' && exercise.commonMistakes.map((m, i) => (
            <View key={i} style={styles.listItem}>
              <Ionicons name="warning-outline" size={18} color={colors.error} />
              <Text style={styles.listText}>{m}</Text>
            </View>
          ))}
        </View>

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alternatif Hareketler</Text>
            {alternatives.map((alt) => alt && (
              <TouchableOpacity
                key={alt.id}
                style={styles.altCard}
                onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: alt.id } })}
                activeOpacity={0.85}
              >
                <View style={styles.altIcon}>
                  <Ionicons name="body-outline" size={20} color={colors.accent} />
                </View>
                <View style={styles.altInfo}>
                  <Text style={styles.altName}>{alt.name}</Text>
                  <Text style={styles.altMeta}>{MUSCLE_LABELS[alt.muscleGroup]}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={metaStyles.box}>
      <Text style={[metaStyles.value, accent && metaStyles.valueAccent]}>{value}</Text>
      <Text style={metaStyles.label}>{label}</Text>
    </View>
  );
}

const metaStyles = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  value: { ...typography.h3, color: colors.text },
  valueAccent: { color: colors.accent },
  label: { ...typography.caption, color: colors.textSecondary },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: spacing.md,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  backLabel: { ...typography.body, color: colors.text },
  favBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favBtnActive: {
    borderColor: colors.error,
    backgroundColor: 'rgba(255,75,75,0.1)',
  },
  envChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  envChipText: { ...typography.caption, color: colors.textSecondary },
  scroll: { flex: 1 },
  content: { paddingBottom: spacing.xxl, gap: spacing.lg },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  notFoundText: { ...typography.body, color: colors.textSecondary },
  header: { paddingHorizontal: spacing.md, gap: spacing.sm },
  title: { ...typography.h1, color: colors.text },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  description: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },
  metaRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabActive: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
  },
  tabLabel: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '600' },
  tabLabelActive: { color: colors.accent },
  tabContent: {
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  listNumber: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  listNumberText: { ...typography.label, color: colors.accent, fontWeight: '700' },
  listText: { ...typography.body, color: colors.text, flex: 1, lineHeight: 24 },
  section: { paddingHorizontal: spacing.md, gap: spacing.md },
  sectionTitle: { ...typography.h4, color: colors.text },
  altCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  altIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  altInfo: { flex: 1 },
  altName: { ...typography.bodyMedium, color: colors.text },
  altMeta: { ...typography.bodySmall, color: colors.textSecondary },
});
