import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { borderRadius, colors, gradients } from '@/src/theme';

interface ProgressBarProps {
  progress: number; // 0-1
  height?: number;
  /** Override gradient with a solid color */
  color?: string;
  gradient?: readonly string[];
  backgroundColor?: string;
}

export function ProgressBar({
  progress,
  height = 6,
  color,
  gradient = gradients.accent,
  backgroundColor = colors.surfaceTertiary,
}: ProgressBarProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const pct = `${clampedProgress * 100}%` as const;

  return (
    <View style={[styles.track, { height, backgroundColor }]}>
      {color ? (
        <View style={[styles.fill, { height, width: pct, backgroundColor: color }]} />
      ) : (
        <LinearGradient
          colors={gradient as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { height, width: pct }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: borderRadius.full,
  },
});
