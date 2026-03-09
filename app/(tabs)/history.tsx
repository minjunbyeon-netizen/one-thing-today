/**
 * 히스토리 화면 — 달성 기록 + 스트릭
 */
import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { HistoryItemCard } from '@/components/history-item';
import { StreakBadge } from '@/components/streak-badge';
import { useTaskContext } from '@/contexts/TaskContext';
import { useHistory } from '@/hooks/use-history';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { dbReady, isPremium, streak } = useTaskContext();
  const { history, loading, reload } = useHistory(dbReady, isPremium);

  const bgColor = isDark ? '#0F0F0F' : '#FAFAFA';
  const textColor = isDark ? '#FFFFFF' : '#1C1C1E';
  const subColor = isDark ? '#8E8E93' : '#8E8E93';

  const handleLockedPress = useCallback(() => {
    router.push('/modal/premium');
  }, []);

  const completedCount = history.filter((h) => !h.isLocked && h.completed).length;
  const totalCount = history.filter((h) => !h.isLocked).length;
  const completionRate = totalCount > 0
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={[styles.emptyIcon]}>{'📭'}</ThemedText>
      <ThemedText style={[styles.emptyText, { color: subColor }]}>
        {'아직 기록이 없어요.\n오늘의 한 가지를 완료해보세요!'}
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <ThemedText style={[styles.headerTitle, { color: textColor }]}>
          {'달성 기록'}
        </ThemedText>
        {streak > 0 && <StreakBadge streak={streak} size="medium" />}
      </View>

      {/* 요약 통계 */}
      {!loading && history.length > 0 && (
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <ThemedText style={[styles.statValue, { color: '#6C63FF' }]}>
              {completedCount}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: subColor }]}>{'완료'}</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <ThemedText style={[styles.statValue, { color: '#FF6B35' }]}>
              {streak}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: subColor }]}>{'연속일'}</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <ThemedText style={[styles.statValue, { color: '#4CAF50' }]}>
              {`${completionRate}%`}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: subColor }]}>{'달성률'}</ThemedText>
          </View>
        </View>
      )}

      {/* 신규 사용자 프리미엄 유도 배너 — 비프리미엄 사용자에게 항상 표시 */}
      {!isPremium && (
        <Pressable
          style={styles.premiumBanner}
          onPress={() => router.push('/modal/premium')}
        >
          <View style={styles.premiumBannerLeft}>
            <ThemedText style={styles.premiumBannerIcon}>{'✨'}</ThemedText>
            <View style={styles.premiumBannerTextWrap}>
              <ThemedText style={styles.premiumBannerTitle}>
                {'프리미엄으로 업그레이드'}
              </ThemedText>
              <ThemedText style={styles.premiumBannerSub}>
                {'히스토리 무제한 · 집중 타이머 · 위젯'}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.premiumBannerArrow}>{'›'}</ThemedText>
        </Pressable>
      )}

      {/* 히스토리 목록 */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#6C63FF" />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <HistoryItemCard item={item} onPressLocked={handleLockedPress} />
          )}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={reload}
              tintColor="#6C63FF"
            />
          }
          ListFooterComponent={
            !isPremium && history.some((h) => h.isLocked) ? (
              <Pressable
                style={styles.upgradeBar}
                onPress={() => router.push('/modal/premium')}
              >
                <ThemedText style={styles.upgradeText}>
                  {'🔒 프리미엄으로 업그레이드하면 모든 기록을 볼 수 있어요 →'}
                </ThemedText>
              </Pressable>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#6C63FF',
    borderRadius: 14,
  },
  premiumBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  premiumBannerIcon: {
    fontSize: 22,
  },
  premiumBannerTextWrap: {
    flex: 1,
    gap: 2,
  },
  premiumBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  premiumBannerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
  premiumBannerArrow: {
    fontSize: 20,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  upgradeBar: {
    marginTop: 8,
    padding: 14,
    backgroundColor: '#6C63FF15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6C63FF40',
  },
  upgradeText: {
    fontSize: 13,
    color: '#6C63FF',
    textAlign: 'center',
  },
});
