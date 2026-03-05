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
} from '@/src/utils/database';

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

export default function HomeScreen() {
  const today = getToday();

  const [mission, setMission] = useState<Mission | null>(null);
  const [checkin, setCheckin] = useState<CheckIn | null>(null);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 버튼 애니메이션 (200ms fade/scale)
  const buttonScale = new Animated.Value(1);

  // 화면 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
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

      setMission(todayMission);
      setCheckin(todayCheckin);
      setStreak(currentStreak);
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
          {/* 스트릭 배지 */}
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Feather name="zap" size={12} color={Colors.accent} />
              <Text style={styles.streakBadgeText}>{streak}일 연속</Text>
            </View>
          )}
        </View>

        {/* 메인 타이틀 */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>오늘의{'\n'}약속</Text>
        </View>

        {/* 미션 카드 */}
        <View
          style={[
            styles.missionCard,
            isDone && styles.missionCardDone,
            isSkipped && styles.missionCardSkipped,
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

          {/* 미션 텍스트 */}
          <Text
            style={[
              styles.missionText,
              isDone && styles.missionTextDone,
            ]}
          >
            {mission.text}
          </Text>

          {/* 난이도 표시 */}
          <View style={styles.difficultyRow}>
            {[1, 2, 3].map((level) => (
              <View
                key={level}
                style={[
                  styles.difficultyDot,
                  level <= mission.difficulty
                    ? styles.difficultyDotActive
                    : styles.difficultyDotInactive,
                ]}
              />
            ))}
            <Text style={styles.difficultyLabel}>
              {mission.difficulty === 1
                ? '쉬움'
                : mission.difficulty === 2
                ? '보통'
                : '어려움'}
            </Text>
          </View>

          {/* 완료 표시 오버레이 */}
          {isDone && (
            <View style={styles.doneOverlay}>
              <Feather name="check" size={20} color={Colors.success} />
              <Text style={styles.doneText}>완료</Text>
            </View>
          )}
        </View>

        {/* 체크인 버튼 영역 */}
        <View style={styles.actionSection}>
          {!isDone && !isSkipped ? (
            <>
              {/* 체크인 모달 열기 버튼 (Primary) */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Pressable
                  style={({ pressed }) => [
                    styles.buttonPrimary,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleOpenCheckin}
                  accessibilityLabel="오늘 약속 체크하기"
                  accessibilityRole="button"
                >
                  <Feather name="check-circle" size={20} color={Colors.white} />
                  <Text style={styles.buttonPrimaryText}>오늘 약속 체크하기</Text>
                </Pressable>
              </Animated.View>

              {/* 건너뛰기 버튼 (Ghost) — 하루 1회 */}
              <Pressable
                style={({ pressed }) => [
                  styles.buttonGhost,
                  pressed && styles.buttonGhostPressed,
                ]}
                onPress={handleSkip}
                accessibilityLabel="오늘은 건너뛰기"
                accessibilityRole="button"
              >
                <Text style={styles.buttonGhostText}>오늘은 건너뛸게요</Text>
              </Pressable>
            </>
          ) : isDone ? (
            <>
              {/* 완료 상태 메시지 */}
              <View style={styles.doneMessage}>
                <Feather name="check-circle" size={24} color={Colors.success} />
                <Text style={styles.doneMessageTitle}>잘 하셨어요!</Text>
                <Text style={styles.doneMessageSub}>
                  오늘의 약속을 지켰습니다.
                </Text>
              </View>

              {/* 오늘 기록 보기 버튼 (체크인 모달 — 결과 확인) */}
              <Pressable
                style={({ pressed }) => [
                  styles.buttonSecondary,
                  pressed && styles.buttonSecondaryPressed,
                ]}
                onPress={handleOpenCheckin}
                accessibilityLabel="오늘 기록 보기"
                accessibilityRole="button"
              >
                <Feather name="file-text" size={16} color={Colors.label} />
                <Text style={styles.buttonSecondaryText}>오늘 기록 보기</Text>
              </Pressable>

              {/* 취소 버튼 (Ghost) */}
              <Pressable
                style={({ pressed }) => [
                  styles.buttonGhost,
                  pressed && styles.buttonGhostPressed,
                ]}
                onPress={handleUndo}
                accessibilityLabel="완료 취소하기"
                accessibilityRole="button"
              >
                <Text style={styles.buttonGhostText}>취소하기</Text>
              </Pressable>
            </>
          ) : (
            <>
              {/* 건너뛴 상태 메시지 */}
              <View style={styles.skippedMessage}>
                <Text style={styles.skippedMessageTitle}>오늘은 건너뛰었어요</Text>
                <Text style={styles.skippedMessageSub}>
                  내일 다시 도전해봐요.
                </Text>
              </View>

              {/* 취소 버튼 (Ghost) */}
              <Pressable
                style={({ pressed }) => [
                  styles.buttonGhost,
                  pressed && styles.buttonGhostPressed,
                ]}
                onPress={handleUndo}
                accessibilityLabel="건너뛰기 취소"
                accessibilityRole="button"
              >
                <Text style={styles.buttonGhostText}>다시 도전하기</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* 스트릭 섹션 */}
        <View style={styles.streakSection}>
          <View style={styles.streakCard}>
            <View style={styles.streakLeft}>
              <Feather name="zap" size={18} color={Colors.accent} />
              <View style={styles.streakTextGroup}>
                <Text style={styles.streakLabel}>연속 실천</Text>
                <Text style={styles.streakCount}>
                  {streak}
                  <Text style={styles.streakUnit}> 일</Text>
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.textTertiary} />
          </View>
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
  },
  mainTitle: {
    fontSize: FontSize['3xl'],
    fontWeight: '700',
    color: Colors.label,
    letterSpacing: -0.5,
    lineHeight: FontSize['3xl'] * 1.2,
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

  // 미션 텍스트
  missionText: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.label,
    lineHeight: FontSize.md * 1.6,
    marginBottom: 20,
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
  doneMessageTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.label,
    marginTop: 4,
  },
  doneMessageSub: {
    fontSize: FontSize.base,
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

  // 스트릭 섹션
  streakSection: {
    marginTop: 0,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakTextGroup: {
    gap: 2,
  },
  streakLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  streakCount: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.label,
    letterSpacing: -0.5,
  },
  streakUnit: {
    fontSize: FontSize.base,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
});
