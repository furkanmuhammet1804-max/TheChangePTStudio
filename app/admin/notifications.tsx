import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AdminButton, AdminCard, PageHeader, StatusBadge } from '@/src/components/admin/ui';
import {
  AUDIENCE_LABELS,
  AUDIENCE_REACH,
  MOCK_SENT_NOTIFICATIONS,
  SentNotification,
} from '@/src/data/adminMock';
import { notify } from '@/src/utils/notify';
import { borderRadius, colors, spacing, typography } from '@/src/theme';
import { NotificationAudience } from '@/src/types/admin';

const AUDIENCES: NotificationAudience[] = ['all', 'premium', 'free'];

export default function AdminNotificationsScreen() {
  const [title, setTitle]       = useState('');
  const [body, setBody]         = useState('');
  const [audience, setAudience] = useState<NotificationAudience>('all');
  const [history, setHistory]   = useState<SentNotification[]>(MOCK_SENT_NOTIFICATIONS);

  const handleSend = () => {
    if (!title.trim() || !body.trim()) {
      notify('Eksik Bilgi', 'Başlık ve mesaj alanlarını doldurmalısın.');
      return;
    }
    // Push altyapısı bağlanana kadar gönderim yereldir — geçmişe eklenir
    const sent: SentNotification = {
      id: `n_${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      audience,
      sentAt: 'Az önce',
      reach: AUDIENCE_REACH[audience],
    };
    setHistory((h) => [sent, ...h]);
    setTitle('');
    setBody('');
    notify(
      'Bildirim Kuyruğa Alındı (Mock)',
      `"${sent.title}" — ${AUDIENCE_LABELS[audience]} (${sent.reach} kullanıcı). Gerçek gönderim push altyapısı bağlanınca aktifleşecek.`,
    );
  };

  return (
    <>
      <PageHeader
        title="Bildirim Yönetimi"
        subtitle="Push bildirimleri oluştur ve hedef kitleye gönder"
      />

      <View style={styles.columns}>
        {/* Compose */}
        <AdminCard
          title="Yeni Bildirim"
          subtitle="Kullanıcılara anlık bildirim gönder"
          style={styles.composeCard}
        >
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>BAŞLIK</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Yeni programlar yayında!"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
              selectionColor={colors.accent}
              maxLength={60}
            />
            <Text style={styles.charCount}>{title.length}/60</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>MESAJ</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Bildirim mesajını yaz..."
              placeholderTextColor={colors.textMuted}
              value={body}
              onChangeText={setBody}
              selectionColor={colors.accent}
              multiline
              numberOfLines={4}
              maxLength={180}
            />
            <Text style={styles.charCount}>{body.length}/180</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>HEDEF KİTLE</Text>
            <View style={styles.audienceRow}>
              {AUDIENCES.map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[styles.audienceChip, audience === a && styles.audienceChipActive]}
                  onPress={() => setAudience(a)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={a === 'all' ? 'people-outline' : a === 'premium' ? 'star-outline' : 'person-outline'}
                    size={14}
                    color={audience === a ? colors.background : colors.textSecondary}
                  />
                  <Text style={[styles.audienceLabel, audience === a && styles.audienceLabelActive]}>
                    {AUDIENCE_LABELS[a]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.reachText}>
              Tahmini erişim: {AUDIENCE_REACH[audience]} kullanıcı
            </Text>
          </View>

          <AdminButton
            label="Bildirim Gönder"
            icon="send-outline"
            variant="primary"
            onPress={handleSend}
          />
        </AdminCard>

        {/* History */}
        <AdminCard
          title="Gönderim Geçmişi"
          subtitle="Son gönderilen bildirimler"
          style={styles.historyCard}
        >
          <View style={styles.historyList}>
            {history.map((n) => (
              <View key={n.id} style={styles.historyItem}>
                <View style={styles.historyIcon}>
                  <Ionicons name="notifications" size={16} color={colors.accent} />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyTitle} numberOfLines={1}>{n.title}</Text>
                  <Text style={styles.historyBody} numberOfLines={2}>{n.body}</Text>
                  <View style={styles.historyMetaRow}>
                    <StatusBadge
                      label={AUDIENCE_LABELS[n.audience]}
                      tone={n.audience === 'premium' ? 'gold' : n.audience === 'free' ? 'muted' : 'accent'}
                    />
                    <Text style={styles.historyMeta}>{n.sentAt} · {n.reach} alıcı</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </AdminCard>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignItems: 'flex-start' },
  composeCard: { flex: 1, minWidth: 300 },
  historyCard: { flex: 1, minWidth: 300 },

  field: { gap: spacing.sm },
  fieldLabel: { ...typography.label, color: colors.textSecondary, letterSpacing: 1 },
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
  inputMultiline: { minHeight: 96, textAlignVertical: 'top' },
  charCount: { ...typography.caption, color: colors.textMuted, alignSelf: 'flex-end' },

  audienceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  audienceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  audienceChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  audienceLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
  audienceLabelActive: { color: colors.background },
  reachText: { ...typography.caption, color: colors.accent },

  historyList: { gap: spacing.sm },
  historyItem: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyInfo: { flex: 1, gap: 4 },
  historyTitle: { ...typography.bodySmall, color: colors.text, fontWeight: '700' },
  historyBody: { ...typography.caption, color: colors.textSecondary, lineHeight: 16 },
  historyMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap', marginTop: 2 },
  historyMeta: { ...typography.caption, color: colors.textMuted },
});
