import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        variant === 'primary' && shadows.accent,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'ghost' ? colors.accent : colors.background}
          size="small"
        />
      ) : (
        <Text style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`]]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  gold: {
    backgroundColor: colors.gold,
    ...shadows.gold,
  },
  size_sm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  size_md: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md - 2,
  },
  size_lg: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    ...typography.h4,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    fontWeight: '700',
  },
  labelSize_md: {
    fontSize: 14,
    fontWeight: '700',
  },
  labelSize_lg: {
    fontSize: 15,
    fontWeight: '800',
  },
});
