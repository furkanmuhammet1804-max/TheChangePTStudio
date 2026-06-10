/**
 * Admin panel form bileşenleri: etiketli metin alanı ve chip tabanlı seçimler.
 */
import React from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { borderRadius, colors, spacing, typography } from '@/src/theme';

// ─── Metin alanı ─────────────────────────────────────────────────────────────

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  maxLength,
  keyboardType,
  secureTextEntry,
  autoCapitalize = 'sentences',
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.accent}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        maxLength={maxLength}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
      />
      {!!maxLength && (
        <Text style={styles.charCount}>{value.length}/{maxLength}</Text>
      )}
    </View>
  );
}

// ─── Tekli chip seçimi ───────────────────────────────────────────────────────

export interface ChipOption<T extends string | number> {
  key: T;
  label: string;
}

export function ChipSelect<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: ChipOption<T>[];
  value: T;
  onChange: (key: T) => void;
}) {
  return (
    <View style={styles.field}>
      {!!label && <Text style={styles.label}>{label.toUpperCase()}</Text>}
      <View style={styles.chipRow}>
        {options.map((opt) => {
          const active = opt.key === value;
          return (
            <TouchableOpacity
              key={String(opt.key)}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onChange(opt.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Çoklu chip seçimi ───────────────────────────────────────────────────────

export function MultiChipSelect<T extends string>({
  label,
  options,
  values,
  onChange,
}: {
  label?: string;
  options: ChipOption<T>[];
  values: T[];
  onChange: (keys: T[]) => void;
}) {
  const toggle = (key: T) => {
    onChange(
      values.includes(key) ? values.filter((v) => v !== key) : [...values, key],
    );
  };

  return (
    <View style={styles.field}>
      {!!label && <Text style={styles.label}>{label.toUpperCase()}</Text>}
      <View style={styles.chipRow}>
        {options.map((opt) => {
          const active = values.includes(opt.key);
          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => toggle(opt.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Anahtar (toggle) satırı ─────────────────────────────────────────────────

export function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <TouchableOpacity style={styles.toggleRow} onPress={() => onChange(!value)} activeOpacity={0.8}>
      <View style={styles.toggleInfo}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {!!description && <Text style={styles.toggleDesc}>{description}</Text>}
      </View>
      <View style={[styles.track, value && styles.trackOn]}>
        <View style={[styles.thumb, value && styles.thumbOn]} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Stiller ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  label: { ...typography.label, color: colors.textSecondary, letterSpacing: 1 },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    ...typography.bodySmall,
    color: colors.text,
  },
  inputMultiline: { minHeight: 92, textAlignVertical: 'top' },
  charCount: { ...typography.caption, color: colors.textMuted, alignSelf: 'flex-end' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
  chipLabelActive: { color: colors.background },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  toggleInfo: { flex: 1 },
  toggleLabel: { ...typography.bodySmall, color: colors.text, fontWeight: '700' },
  toggleDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  track: {
    width: 42,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  trackOn: { backgroundColor: colors.accentMuted, borderColor: colors.accent },
  thumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.textSecondary,
  },
  thumbOn: { backgroundColor: colors.accent, alignSelf: 'flex-end' },
});
