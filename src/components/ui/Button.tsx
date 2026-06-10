import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import { borderRadius, colors, gradients, shadows, spacing, typography } from '@/src/theme';
import { hapticTap } from '@/src/utils/haptics';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const GRADIENT_VARIANTS: Record<string, readonly string[]> = {
  primary: gradients.accent,
  gold: gradients.gold,
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  style,
  disabled,
  onPress,
  ...rest
}: ButtonProps) {
  const isGradient = variant === 'primary' || variant === 'gold';
  const isDisabled = disabled || loading;

  const handlePress: TouchableOpacityProps['onPress'] = (e) => {
    hapticTap();
    onPress?.(e);
  };

  const content = loading ? (
    <ActivityIndicator
      color={variant === 'ghost' || variant === 'secondary' ? colors.accent : colors.background}
      size="small"
    />
  ) : (
    <Text style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`]]}>
      {title}
    </Text>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isDisabled}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      style={[
        styles.base,
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        !isGradient && styles[variant],
        isGradient && (variant === 'gold' ? shadows.gold : shadows.accent),
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {isGradient && (
        <LinearGradient
          colors={GRADIENT_VARIANTS[variant] as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {/* Top sheen for extra depth on gradient buttons */}
      {isGradient && <View style={styles.sheen} pointerEvents="none" />}
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    overflow: 'hidden',
  },
  secondary: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  size_sm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  size_md: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md - 1,
  },
  size_lg: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + 2,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...typography.h4,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  label_primary: {
    color: colors.background,
  },
  label_secondary: {
    color: colors.text,
  },
  label_ghost: {
    color: colors.accent,
  },
  label_gold: {
    color: colors.background,
  },
  labelSize_sm: {
    fontSize: 12,
    fontWeight: '800',
  },
  labelSize_md: {
    fontSize: 14,
    fontWeight: '800',
  },
  labelSize_lg: {
    fontSize: 15,
    fontWeight: '900',
  },
});
