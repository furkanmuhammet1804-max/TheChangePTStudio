import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '@/src/theme';

export interface TableColumn<T> {
  key: string;
  title: string;
  /** Sabit taban genişlik — dar ekranda yatay kaydırma için */
  width: number;
  /** Geniş ekranda kalan alanı paylaşma oranı */
  flex?: number;
  /** Özel hücre içeriği; verilmezse `value` metni gösterilir */
  render?: (item: T) => React.ReactNode;
  value?: (item: T) => string;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyText?: string;
}

/**
 * Yatay kaydırılabilir, esnek kolonlu admin tablosu.
 * Backend geldiğinde sayfalama/sıralama prop'larıyla genişletilebilir.
 */
export function DataTable<T>({ columns, data, keyExtractor, emptyText = 'Kayıt bulunamadı.' }: DataTableProps<T>) {
  const minWidth = columns.reduce((sum, c) => sum + c.width, 0);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.scrollContent}>
      <View style={[styles.table, { minWidth }]}>
        {/* Header */}
        <View style={[styles.row, styles.headerRow]}>
          {columns.map((col) => (
            <View key={col.key} style={[styles.cell, { width: col.width, flexGrow: col.flex ?? 1 }]}>
              <Text style={styles.headerText}>{col.title}</Text>
            </View>
          ))}
        </View>

        {/* Rows */}
        {data.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>{emptyText}</Text>
          </View>
        ) : (
          data.map((item, i) => (
            <View
              key={keyExtractor(item)}
              style={[styles.row, i % 2 === 1 && styles.rowAlt, i === data.length - 1 && styles.rowLast]}
            >
              {columns.map((col) => (
                <View key={col.key} style={[styles.cell, { width: col.width, flexGrow: col.flex ?? 1 }]}>
                  {col.render ? (
                    col.render(item)
                  ) : (
                    <Text style={styles.cellText} numberOfLines={1}>
                      {col.value ? col.value(item) : ''}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  table: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowAlt: { backgroundColor: colors.surfaceSecondary },
  rowLast: { borderBottomWidth: 0 },
  headerRow: { backgroundColor: colors.surfaceTertiary },
  cell: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    justifyContent: 'center',
  },
  headerText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cellText: { ...typography.bodySmall, color: colors.text },
  emptyRow: { padding: spacing.lg, alignItems: 'center', backgroundColor: colors.surface },
  emptyText: { ...typography.bodySmall, color: colors.textMuted },
});
