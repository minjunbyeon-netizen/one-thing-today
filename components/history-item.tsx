/**
 * HistoryItem — 히스토리 목록 아이템
 */
import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { HistoryItem as HistoryItemType } from '@/hooks/use-history';

type Props = {
  item: HistoryItemType;
  onPressLocked?: () => void;
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[d.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

export function HistoryItemCard({ item, onPressLocked }: Props) {
  const borderColor = useThemeColor({ light: '#E0E0E0', dark: '#333333' }, 'icon');
  const lockedBg = useThemeColor({ light: '#F5F5F5', dark: '#1A1A1A' }, 'background');

  if (item.isLocked) {
    return (
      <Pressable onPress={onPressLocked}>
        <View style={[styles.card, styles.lockedCard, { borderColor, backgroundColor: lockedBg }]}>
          <ThemedText style={styles.lockedDate}>{formatDate(item.date)}</ThemedText>
          <View style={styles.lockRow}>
            <ThemedText style={styles.lockIcon}>{'🔒'}</ThemedText>
            <ThemedText style={styles.lockText}>{'프리미엄에서 확인 가능'}</ThemedText>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <ThemedView style={[styles.card, { borderColor }]}>
      <View style={styles.header}>
        <ThemedText style={styles.date}>{formatDate(item.date)}</ThemedText>
        <View style={[styles.badge, item.completed ? styles.badgeDone : styles.badgeMiss]}>
          <ThemedText style={styles.badgeText}>
            {item.completed ? '완료' : '미완'}
          </ThemedText>
        </View>
      </View>
      <ThemedText style={styles.title} numberOfLines={2}>
        {item.title || '할일 없음'}
      </ThemedText>
      {item.note ? (
        <ThemedText style={styles.note} numberOfLines={1}>
          {item.note}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  lockedCard: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  date: {
    fontSize: 13,
    color: '#888888',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeDone: {
    backgroundColor: '#4CAF5020',
  },
  badgeMiss: {
    backgroundColor: '#F4433620',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  note: {
    fontSize: 13,
    color: '#888888',
    marginTop: 4,
  },
  lockedDate: {
    fontSize: 13,
    color: '#AAAAAA',
    marginBottom: 6,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lockIcon: {
    fontSize: 14,
  },
  lockText: {
    fontSize: 13,
    color: '#AAAAAA',
  },
});
