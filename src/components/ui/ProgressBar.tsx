import React from 'react';
import { StyleSheet, View } from 'react-native';
import { borderRadius, colors } from '@/src/theme';

interface ProgressBarProps {
  progress: number; // 0-1
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export function ProgressBar({
  progress,
  height = 6,
  color = colors.accent,
  backgroundColor = colors.surfaceTertiary,
}: ProgressBarProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  return (
    <View style={[styles.track, { height, backgroundColor }]}>
      <View
        style={[
          styles.fill,
          {
            height,
            width: `${clampedProgress * 100}%`,
            backgroundColor: color,
          },
        ]}
      />
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
