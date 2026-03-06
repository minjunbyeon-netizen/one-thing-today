// ============================================================
// 오늘 하나 — 홈 화면
// 오늘의 미션 카드 + 체크인 버튼 + 스트릭 표시
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
// SafeAreaView는 react-native-safe-area-context 에서 가져온다
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';

import { Colors } from '@/src/constants/colors';
import { Typography, FontSize } from '@/src/constants/typography';
import { CATEGORY_LABELS, MissionCategory } from '@/src/types';
import type { Mission, CheckIn } from '@/src/types';
import { getTodayMission } from '@/src/utils/missionSelector';
import {
  getSettings,
  getCheckin,
  saveCheckin,
  getStreak,
  getCheckinsByMonth,
} from '@/src/utils/database';
import { getStreakMessage } from '@/src/utils/streakMessages';

// 오늘 날짜 YYYY-MM-DD
function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

// 날짜 한국어 포맷 (예: 3월 5일 수요일)
function formatDateKo(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dow = days[date.getDay()];
  return `${month}월 ${day}일 ${dow}요일`;
}

type CheckinStatus = 'done' | 'undone' | 'skipped' | null;

/** 오후 5시 이후면 저녁(체크인) 모드 */
function getTimeMode(): 'morning' | 'evening' {
  return new Date().getHours() >= 17 ? 'evening' : 'morning';
}

export default function HomeScreen() {
  const today = getToday();

  const [mission, setMission] = useState<Mission | null>(null);
  const [checkin, setCheckin] = useState<CheckIn | null>(null);
  const [streak, setStreak] = useState(0);
  const [monthDone, setMonthDone] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timeMode, setTimeMode] = useState<'morning' | 'evening'>(getTimeMode());
  const [tipsOpen, setTipsOpen] = useState(false);

  // 버튼 애니메이션 (200ms fade/scale)
  const buttonScale = new Animated.Value(1);

  // 화면 포커스될 때마다 데이터 + 시간대 새로고침
  useFocusEffect(
    useCallback(() => {
      setTimeMode(getTimeMode());
      setTipsOpen(false);
      loadData();
    }, [])
  );

  function loadData() {
    setIsLoading(true);
    try {
      const settings = getSettings();
      const todayMission = getTodayMission(settings);
      const todayCheckin = getCheckin(today);
      const currentStreak = getStreak();
      const yearMonth = today.slice(0, 7);
      const monthCheckins = getCheckinsByMonth(yearMonth);
      const doneThisMonth = monthCheckins.filter(c => c.status === 'done').length;

      setMission(todayMission);
      setCheckin(todayCheckin);
      setStreak(currentStreak);
      setMonthDone(doneThisMonth);
    } catch (error) {
      console.warn('홈 데이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // 체크인 모달 열기
  function handleOpenCheckin() {
    router.push('/checkin');
  }

  // 건너뛰기 (하루 1회, 직접 저장)
  async function handleSkip() {
    if (!mission) return;

    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const saved = saveCheckin(
        today,
        mission.id,
        mission.text,
        mission.category,
        'skipped'
      );
      setCheckin(saved);
      setStreak(getStreak());
    } catch (error) {
      console.warn('건너뛰기 저장 오류:', error);
    }
  }

  // (하위 호환) 직접 상태 변경 — undo 용도로만 사용
  async function handleCheckin(status: 'done' | 'skipped') {
    if (!mission) return;

    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(
        status === 'done'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light
      );
    }

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const saved = saveCheckin(
        today,
        mission.id,
        mission.text,
        mission.category,
        status
      );
      setCheckin(saved);
      setStreak(getStreak());
    } catch (error) {
      console.warn('체크인 저장 오류:', error);
    }
  }

  // 이미 체크인한 경우 취소 (다시 undone으로)
  async function handleUndo() {
    if (!mission) return;

    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const saved = saveCheckin(
        today,
        mission.id,
        mission.text,
        mission.category,
        'undone'
      );
      setCheckin(saved);
      setStreak(getStreak());
    } catch (error) {
      console.warn('체크인 취소 오류:', error);
    }
  }

  const checkinStatus: CheckinStatus = checkin?.status ?? null;
  const isDone = checkinStatus === 'done';
  const isSkipped = checkinStatus === 'skipped';

  if (isLoading || !mission) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isChecked = isDone || isSkipped;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{formatDateKo(today)}</Text>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>{streak}일 연속</Text>
            </View>
          )}
        </View>

        {/* 메인 타이틀 — 시간대별 */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>
            {isChecked
              ? isDone ? '오늘도\n해냈어요' : '내일\n다시 해봐요'
              : timeMode === 'morning'
              ? '오늘의\n약속'
              : '오늘\n어떠셨나요?'}
          </Text>
          {!isChecked && timeMode === 'morning' && (
            <Text style={styles.modeHint}>하루 동안 실천하고, 저녁에 체크해요</Text>
          )}
        </View>

        {/* 미션 카드 — 탭하면 팁 펼치기 */}
        <Pressable
          onPress={() => setTipsOpen(o => !o)}
          style={({ pressed }) => [
            styles.missionCard,
            isDone && styles.missionCardDone,
            isSkipped && styles.missionCardSkipped,
            pressed && { opacity: 0.95 },
          ]}
        >
          {/* 카테고리 뱃지 */}
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: Colors.categoryBg[mission.category] },
            ]}
          >
            <Text
              style={[
                styles.categoryBadgeText,
                { color: Colors.categories[mission.category] },
              ]}
            >
              {CATEGORY_LABELS[mission.category]}
            </Text>
          </View>

          {/* 미션 메인 텍스트 */}
          <Text style={[styles.missionShortText, isDone && styles.missionTextDone]}>
            {mission.shortText ?? mission.text}
          </Text>

          {/* 미션 부연 설명 */}
          {mission.shortText && (
            <Text style={styles.missionSubText}>{mission.text}</Text>
          )}

          {/* 난이도 */}
          <View style={styles.difficultyRow}>
            {[1, 2, 3].map((level) => (
              <View
                key={level}
                style={[
                  styles.difficultyDot,
                  level <= mission.difficulty ? styles.difficultyDotActive : styles.difficultyDotInactive,
                ]}
              />
            ))}
            <Text style={styles.difficultyLabel}>
              {mission.difficulty === 1 ? '쉬움' : mission.difficulty === 2 ? '보통' : '어려움'}
            </Text>
            <View style={{ flex: 1 }} />
            <Feather
              name={tipsOpen ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={Colors.textTertiary}
            />
          </View>

          {/* 실천 팁 (펼쳤을 때) */}
          {tipsOpen && (
            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>실천 팁</Text>
              <Text style={styles.tipsText}>
                {mission.tip ?? '오늘 하루 중 딱 한 번만 해보세요. 완벽하지 않아도 괜찮아요.'}
              </Text>
            </View>
          )}

          {/* 완료 표시 */}
          {isDone && (
            <View style={styles.doneOverlay}>
              <Feather name="check" size={20} color={Colors.success} />
              <Text style={styles.doneText}>완료</Text>
            </View>
          )}
        </Pressable>

        {/* 이번 달 진행 현황 */}
        {monthDone > 0 && (
          <View style={styles.monthProgress}>
            <View style={styles.monthProgressHeader}>
              <Text style={styles.monthProgressLabel}>이번 달 달성</Text>
              <Text style={styles.monthProgressCount}>{monthDone}일</Text>
            </View>
            <View style={styles.monthProgressBar}>
              <View
                style={[
                  styles.monthProgressFill,
                  { width: `${Math.min((monthDone / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()) * 100, 100)}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* 액션 영역 */}
        <View style={styles.actionSection}>

          {/* ── 이미 체크인 완료 ── */}
          {isDone ? (
            <>
              <View style={styles.doneMessage}>
                <Text style={styles.streakNumber}>{streak}</Text>
                <Text style={styles.doneMessageTitle}>{getStreakMessage(streak)}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.buttonSecondary, pressed && styles.buttonSecondaryPressed]}
                onPress={handleOpenCheckin}
              >
                <Feather name="file-text" size={16} color={Colors.label} />
                <Text style={styles.buttonSecondaryText}>오늘 기록 보기</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.buttonGhost, pressed && styles.buttonGhostPressed]}
                onPress={handleUndo}
              >
                <Text style={styles.buttonGhostText}>취소하기</Text>
              </Pressable>
            </>

          ) : isSkipped ? (
            <>
              <View style={styles.skippedMessage}>
                <Text style={styles.skippedMessageTitle}>오늘은 건너뛰었어요</Text>
                <Text style={styles.skippedMessageSub}>내일 다시 도전해봐요.</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.buttonGhost, pressed && styles.buttonGhostPressed]}
                onPress={handleUndo}
              >
                <Text style={styles.buttonGhostText}>다시 도전하기</Text>
              </Pressable>
            </>

          ) : timeMode === 'morning' ? (
            /* ── 아침 모드: 체크인 버튼 없음 ── */
            <View style={styles.morningHintBox}>
              <Feather name="sun" size={18} color={Colors.warning} />
              <Text style={styles.morningHintText}>
                오늘 하루 실천해보세요.{'\n'}저녁 알림이 오면 결과를 기록해요.
              </Text>
            </View>

          ) : (
            /* ── 저녁 모드: 체크인 버튼 표시 ── */
            <>
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Pressable
                  style={({ pressed }) => [styles.buttonPrimary, pressed && styles.buttonPressed]}
                  onPress={handleOpenCheckin}
                >
                  <Feather name="check-circle" size={20} color={Colors.white} />
                  <Text style={styles.buttonPrimaryText}>오늘 약속 체크하기</Text>
                </Pressable>
              </Animated.View>
              <Pressable
                style={({ pressed }) => [styles.buttonGhost, pressed && styles.buttonGhostPressed]}
                onPress={handleSkip}
              >
                <Text style={styles.buttonGhostText}>오늘은 건너뛸게요</Text>
              </Pressable>
            </>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ──────────────────────────────────────────────────────────
// 스타일
// ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // 로딩
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  dateText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  streakBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.accent,
  },

  // 메인 타이틀
  titleSection: {
    marginBottom: 24,
    gap: 6,
  },
  mainTitle: {
    fontSize: FontSize['3xl'],
    fontWeight: '700',
    color: Colors.label,
    letterSpacing: -0.5,
    lineHeight: FontSize['3xl'] * 1.2,
  },
  modeHint: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    fontWeight: '400',
  },

  // 미션 카드
  missionCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    // 그림자 (iOS)
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    // 그림자 (Android)
    elevation: 2,
  },
  missionCardDone: {
    borderColor: Colors.success,
    borderWidth: 1.5,
  },
  missionCardSkipped: {
    opacity: 0.6,
  },

  // 카테고리 뱃지
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 16,
  },
  categoryBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // 미션 메인 텍스트 (shortText 대형)
  missionShortText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.label,
    lineHeight: 22 * 1.3,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  // 미션 부연 설명 (text 서브)
  missionSubText: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: 14 * 1.6,
    marginBottom: 12,
  },
  missionTextDone: {
    color: Colors.textSecondary,
  },

  // 난이도
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  difficultyDotActive: {
    backgroundColor: Colors.accent,
  },
  difficultyDotInactive: {
    backgroundColor: Colors.border,
  },
  difficultyLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },

  // 실천 팁
  tipsBox: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    gap: 6,
  },
  tipsTitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipsText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.6,
  },

  // 아침 힌트 박스
  morningHintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFF9EE',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE8A3',
  },
  morningHintText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.6,
  },

  // 완료 오버레이
  doneOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  doneText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.success,
  },

  // 이번 달 진행 현황
  monthProgress: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    gap: 10,
  },
  monthProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthProgressLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  monthProgressCount: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
  },
  monthProgressBar: {
    height: 5,
    backgroundColor: Colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  monthProgressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },

  // 액션 섹션
  actionSection: {
    gap: 12,
    marginBottom: 32,
  },

  // 완료 메시지
  doneMessage: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  streakNumber: {
    fontSize: FontSize['4xl'],
    fontWeight: '700',
    color: Colors.label,
    letterSpacing: -1,
  },
  doneMessageTitle: {
    fontSize: FontSize.base,
    fontWeight: '500',
    color: Colors.textSecondary,
  },

  // 건너뛴 메시지
  skippedMessage: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  skippedMessageTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  skippedMessageSub: {
    fontSize: FontSize.base,
    color: Colors.textTertiary,
  },

  // 버튼 — Primary
  buttonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonPrimaryText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: -0.1,
  },

  // 버튼 — Secondary
  buttonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonSecondaryPressed: {
    backgroundColor: Colors.background,
  },
  buttonSecondaryText: {
    fontSize: FontSize.base,
    fontWeight: '500',
    color: Colors.label,
  },

  // 버튼 — Ghost
  buttonGhost: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  buttonGhostPressed: {
    opacity: 0.5,
  },
  buttonGhostText: {
    fontSize: FontSize.base,
    fontWeight: '500',
    color: Colors.textSecondary,
  },

});
