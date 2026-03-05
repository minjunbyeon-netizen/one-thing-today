// ============================================================
// 오늘 하나 — 히스토리 화면
// 최근 체크인 기록 목록
// ============================================================

import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Colors } from '@/src/constants/colors';
import { Typography, FontSize } from '@/src/constants/typography';
import { CATEGORY_LABELS } from '@/src/types';
import type { CheckIn } from '@/src/types';
import { getRecentCheckins } from '@/src/utils/database';

// 날짜 한국어 포맷
function formatDateKo(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dow = days[date.getDay()];
  return `${month}월 ${day}일 ${dow}`;
}

// 상태별 아이콘 및 색상
function getStatusInfo(status: CheckIn['status']) {
  switch (status) {
    case 'done':
      return { icon: 'check-circle' as const, color: Colors.success, label: '완료' };
    case 'undone':
      return { icon: 'circle' as const, color: Colors.disabled, label: '미완료' };
    case 'skipped':
      return { icon: 'minus-circle' as const, color: Colors.textTertiary, label: '건너뜀' };
  }
}

function HistoryItem({ item }: { item: CheckIn }) {
  const statusInfo = getStatusInfo(item.status);

  return (
    <View style={styles.historyItem}>
      {/* 날짜 */}
      <View style={styles.historyDate}>
        <Text style={styles.historyDateText}>{formatDateKo(item.date)}</Text>
      </View>

      {/* 내용 */}
      <View style={styles.historyContent}>
        {/* 카테고리 + 상태 */}
        <View style={styles.historyMeta}>
          <View
            style={[
              styles.categoryChip,
              { backgroundColor: Colors.categoryBg[item.category] },
            ]}
          >
            <Text
              style={[
                styles.categoryChipText,
                { color: Colors.categories[item.category] },
              ]}
            >
              {CATEGORY_LABELS[item.category]}
            </Text>
          </View>
          <View style={styles.statusChip}>
            <Feather name={statusInfo.icon} size={12} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* 미션 텍스트 */}
        <Text
          style={[
            styles.historyMissionText,
            item.status !== 'done' && styles.historyMissionTextMuted,
          ]}
          numberOfLines={2}
        >
          {item.missionText}
        </Text>

        {/* 메모 */}
        {item.memo ? (
          <Text style={styles.memoText} numberOfLines={1}>
            {item.memo}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Feather name="calendar" size={40} color={Colors.disabled} />
      <Text style={styles.emptyTitle}>기록이 없어요</Text>
      <Text style={styles.emptySubtitle}>
        오늘의 약속을 지키면{'\n'}여기에 기록이 쌓입니다.
      </Text>
    </View>
  );
}

export default function HistoryScreen() {
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  function loadHistory() {
    setIsLoading(true);
    try {
      const data = getRecentCheckins(60);
      setCheckins(data);
    } catch (error) {
      console.warn('히스토리 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // 완료 비율 계산
  const doneCount = checkins.filter((c) => c.status === 'done').length;
  const total = checkins.length;
  const rate = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>기록</Text>
      </View>

      {/* 요약 카드 */}
      {total > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{total}</Text>
            <Text style={styles.summaryLabel}>전체</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              {doneCount}
            </Text>
            <Text style={styles.summaryLabel}>완료</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Colors.accent }]}>
              {rate}%
            </Text>
            <Text style={styles.summaryLabel}>달성률</Text>
          </View>
        </View>
      )}

      {/* 목록 */}
      <FlatList
        data={checkins}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <HistoryItem item={item} />}
        ListEmptyComponent={!isLoading ? <EmptyState /> : null}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // 헤더
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  screenTitle: {
    ...Typography.screenTitle,
    color: Colors.label,
  },

  // 요약 카드
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 14,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.label,
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },

  // 목록
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 0,
  },

  // 히스토리 아이템
  historyItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
  },
  historyDate: {
    width: 64,
    paddingTop: 2,
  },
  historyDateText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: FontSize.xs * 1.6,
  },
  historyContent: {
    flex: 1,
    gap: 8,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryChipText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  historyMissionText: {
    fontSize: FontSize.base,
    fontWeight: '400',
    color: Colors.label,
    lineHeight: FontSize.base * 1.5,
  },
  historyMissionTextMuted: {
    color: Colors.textSecondary,
  },
  memoText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },

  // 빈 상태
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: FontSize.base,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: FontSize.base * 1.6,
  },
});
