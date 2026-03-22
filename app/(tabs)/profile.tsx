// ============================================================
// 오늘 하나 — 프로필 / 마이페이지
// ============================================================

import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Colors } from '@/src/constants/colors';
import { FontSize } from '@/src/constants/typography';
import { CATEGORY_LABELS, MissionCategory } from '@/src/types';
import type { CheckIn } from '@/src/types';
import { getAllCheckins, getSettings, getStreak } from '@/src/utils/database';
import { MISSIONS } from '@/src/data/missions';

function getMissionText(missionId: string, fallback: string): string {
  const found = MISSIONS.find(m => m.id === missionId);
  return found ? (found.shortText ?? found.text) : fallback;
}

const ALL_CATEGORIES: MissionCategory[] = [
  'relationship', 'selfcare', 'gratitude', 'restraint', 'environment', 'growth',
];

const MILESTONES = [
  { days: 7, label: '7일 달성', icon: 'star' as const },
  { days: 14, label: '14일 달성', icon: 'award' as const },
  { days: 30, label: '30일 달성', icon: 'zap' as const },
  { days: 100, label: '100일 달성', icon: 'flag' as const },
];

function formatDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dow = days[new Date(dateStr).getDay()];
  return `${m}월 ${d}일 ${dow}`;
}

export default function ProfileScreen() {
  const [nickname, setNickname] = useState<string | undefined>();
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [streak, setStreak] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const settings = getSettings();
      setNickname(settings.nickname);
      setCheckins(getAllCheckins());
      setStreak(getStreak());
    }, [])
  );

  const total = checkins.length;
  const done = checkins.filter(c => c.status === 'done').length;
  const undone = checkins.filter(c => c.status === 'undone').length;
  const rate = total > 0 ? Math.round((done / total) * 100) : 0;

  // 카테고리별 집계
  const catStats = ALL_CATEGORIES.map(cat => {
    const catCheckins = checkins.filter(c => c.category === cat);
    const catDone = catCheckins.filter(c => c.status === 'done').length;
    return { cat, total: catCheckins.length, done: catDone };
  }).filter(s => s.total > 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* 프로필 헤더 */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Feather name="user" size={32} color={Colors.accent} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {nickname ? nickname : '나'}
            </Text>
            <Text style={styles.profileSub}>오늘 하나 멤버</Text>
          </View>
        </View>

        {/* 스트릭 배너 */}
        {streak > 0 && (
          <View style={styles.streakBanner}>
            <Feather name="zap" size={18} color={Colors.warning} />
            <Text style={styles.streakText}>
              {streak}일 연속 실천 중
            </Text>
          </View>
        )}

        {/* 통계 카드 — 2×2 그리드 */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatBox value={String(total)} label="전체 도전" />
            <StatBox value={String(done)} label="성공" color={Colors.success} />
          </View>
          <View style={styles.statsRow}>
            <StatBox value={String(undone)} label="미완료" color={Colors.disabled} />
            <StatBox value={`${rate}%`} label="달성률" color={Colors.accent} />
          </View>
        </View>

        {/* 마일스톤 뱃지 */}
        <Text style={styles.sectionTitle}>마일스톤</Text>
        <View style={styles.milestoneRow}>
          {MILESTONES.map(m => {
            const unlocked = done >= m.days;
            return (
              <View key={m.days} style={[styles.milestoneBadge, unlocked && styles.milestoneBadgeUnlocked]}>
                <Feather name={m.icon} size={20} color={unlocked ? Colors.accent : Colors.disabled} />
                <Text style={[styles.milestoneDays, unlocked && styles.milestoneDaysUnlocked]}>{m.days}일</Text>
                <Text style={[styles.milestoneLabel, unlocked && styles.milestoneLabelUnlocked]}>{unlocked ? '달성' : '도전 중'}</Text>
              </View>
            );
          })}
        </View>

        {/* 카테고리별 현황 */}
        {catStats.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>카테고리별 현황</Text>
            <View style={styles.catCard}>
              {catStats.map(({ cat, total: t, done: d }, idx) => (
                <View key={cat}>
                  {idx > 0 && <View style={styles.divider} />}
                  <View style={styles.catRow}>
                    <View style={[styles.catDot, { backgroundColor: Colors.categories[cat] }]} />
                    <Text style={styles.catLabel}>{CATEGORY_LABELS[cat]}</Text>
                    <View style={styles.catBarWrap}>
                      <View style={styles.catBarBg}>
                        <View
                          style={[
                            styles.catBarFill,
                            {
                              width: `${t > 0 ? (d / t) * 100 : 0}%`,
                              backgroundColor: Colors.categories[cat],
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={styles.catCount}>{d}/{t}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* 전체 도전 목록 */}
        {checkins.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>전체 도전 기록</Text>
            <View style={styles.historyCard}>
              {checkins.map((c, idx) => (
                <View key={c.id}>
                  {idx > 0 && <View style={styles.divider} />}
                  <View style={styles.historyRow}>
                    <Feather
                      name={c.status === 'done' ? 'check-circle' : 'circle'}
                      size={16}
                      color={c.status === 'done' ? Colors.success : Colors.disabled}
                      style={styles.historyIcon}
                    />
                    <View style={styles.historyContent}>
                      <Text style={styles.historyDate}>{formatDate(c.date)}</Text>
                      <Text style={styles.historyMission} numberOfLines={1}>
                        {getMissionText(c.missionId, c.missionText)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.catChipSmall,
                        { backgroundColor: Colors.categoryBg[c.category] },
                      ]}
                    >
                      <Text style={[styles.catChipText, { color: Colors.categories[c.category] }]}>
                        {CATEGORY_LABELS[c.category]}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {checkins.length === 0 && (
          <View style={styles.empty}>
            <Feather name="inbox" size={40} color={Colors.disabled} />
            <Text style={styles.emptyTitle}>아직 도전 기록이 없어요</Text>
            <Text style={styles.emptySub}>오늘의 미션을 시작해보세요!</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },

  // 프로필 헤더
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: { gap: 4 },
  profileName: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Colors.label,
    letterSpacing: -0.5,
  },
  profileSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // 스트릭 배너
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF5E6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD59A',
  },
  streakText: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.warning,
  },

  // 통계 그리드
  statsGrid: {
    gap: 10,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.label,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  // 마일스톤
  milestoneRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  milestoneBadge: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 5,
    opacity: 0.45,
  },
  milestoneBadgeUnlocked: {
    opacity: 1,
    borderColor: Colors.accent,
  },
  milestoneDays: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  milestoneDaysUnlocked: {
    color: Colors.label,
  },
  milestoneLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  milestoneLabelUnlocked: {
    color: Colors.accent,
    fontWeight: '600',
  },

  // 카테고리 카드
  catCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catLabel: {
    fontSize: FontSize.sm,
    color: Colors.label,
    width: 64,
  },
  catBarWrap: { flex: 1 },
  catBarBg: {
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  catCount: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    width: 30,
    textAlign: 'right',
  },

  // 히스토리 카드
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  historyIcon: { marginTop: 1 },
  historyContent: { flex: 1, gap: 3 },
  historyDate: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  historyMission: {
    fontSize: FontSize.sm,
    color: Colors.label,
  },
  catChipSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catChipText: {
    fontSize: 10,
    fontWeight: '600',
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },

  // 빈 상태
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 8,
  },
  emptySub: {
    fontSize: FontSize.base,
    color: Colors.textTertiary,
  },
});
