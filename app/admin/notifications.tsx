import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FormField } from '@/src/components/admin/forms';
import { AdminButton, AdminCard, PageHeader, StatusBadge } from '@/src/components/admin/ui';
import { AUDIENCE_LABELS } from '@/src/constants/strings';
import { useAppState } from '@/src/services/appStore';
import { getDataSource } from '@/src/services/dataSource';
import { audienceUsers } from '@/src/services/notificationService';
import { borderRadius, colors, spacing, typography } from '@/src/theme';
import { NotificationAudience } from '@/src/types/admin';
import { formatRelativeTime } from '@/src/utils/formatters';
import { notify } from '@/src/utils/notify';

const AUDIENCES: NotificationAudience[] = ['all', 'premium', 'free'];

const AUDIENCE_ICONS: Record<NotificationAudience, 'people-outline' | 'star-outline' | 'person-outline'> = {
  all: 'people-outline',
  premium: 'star-outline',
  free: 'person-outline',
};

export default function AdminNotificationsScreen() {
  const users     = useAppState((s) => s.users);
  const campaigns = useAppState((s) => s.campaigns);
  const settings  = useAppState((s) => s.settings);

  const [title, setTitle]       = useState('');
  const [body, setBody]         = useState('');
  const [audience, setAudience] = useState<NotificationAudience>('all');
  const [sending, setSending]   = useState(false);

  const reach = audienceUsers(users, audience).length;

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      notify('Eksik Bilgi', 'Başlık ve mesaj alanlarını doldurmalısın.');
      return;
    }
    if (sending) return;
    setSending(true);
    try {
      const campaign = await getDataSource().notifications.sendCampaign({
        title: title.trim(),
        body: body.trim(),
        audience,
      });
      setTitle('');
      setBody('');
      notify(
        'Bildirim Gönderildi',
        `"${campaign.title}" — ${AUDIENCE_LABELS[audience]} (${campaign.reach} kullanıcı). ` +
          (Platform.OS === 'web'
            ? 'Kampanya kaydedildi; mobil cihazlarda yerel bildirim olarak teslim edilir.'
            : 'Bildirim birazdan bu cihaza düşecek.') +
          (settings.pushEnabled
            ? ''
            : ' Tüm kullanıcı cihazlarına eşzamanlı dağıtım, push sunucusu bağlandığında başlar.'),
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Bildirim Yönetimi"
        subtitle="Bildirim oluştur ve hedef kitleye gönder"
      />

      <View style={styles.columns}>
        {/* Yeni bildirim */}
        <AdminCard
          title="Yeni Bildirim"
          subtitle="Kullanıcılara anlık bildirim gönder"
          style={styles.composeCard}
        >
          <FormField
            label="Başlık"
            value={title}
            onChangeText={setTitle}
            placeholder="Örn: Yeni programlar yayında!"
            maxLength={60}
          />
          <FormField
            label="Mesaj"
            value={body}
            onChangeText={setBody}
            placeholder="Bildirim mesajını yaz..."
            multiline
            maxLength={180}
          />

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
                    name={AUDIENCE_ICONS[a]}
                    size={14}
                    color={audience === a ? colors.background : colors.textSecondary}
                  />
                  <Text style={[styles.audienceLabel, audience === a && styles.audienceLabelActive]}>
                    {AUDIENCE_LABELS[a]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.reachText}>Hedef kitle: {reach} kullanıcı</Text>
          </View>

          <AdminButton
            label={sending ? 'Gönderiliyor...' : 'Bildirim Gönder'}
            icon="send-outline"
            variant="primary"
            onPress={handleSend}
          />
        </AdminCard>

        {/* Geçmiş */}
        <AdminCard
          title="Gönderim Geçmişi"
          subtitle="Son gönderilen bildirimler"
          style={styles.historyCard}
        >
          {campaigns.length === 0 ? (
            <Text style={styles.emptyText}>Henüz bildirim gönderilmedi.</Text>
          ) : (
            <View style={styles.historyList}>
              {campaigns.map((n) => (
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
                      <Text style={styles.historyMeta}>
                        {formatRelativeTime(n.sentAt ?? n.createdAt)} · {n.reach} alıcı
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
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

  emptyText: { ...typography.bodySmall, color: colors.textMuted },
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
