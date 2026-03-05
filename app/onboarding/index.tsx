// ============================================================
// 오늘 하나 — 온보딩 화면 (3단계)
// 1단계: 환영 / 2단계: 카테고리 선택 / 3단계: 알림 시간 설정
// ============================================================

import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Colors } from '@/src/constants/colors';
import { Typography, FontSize } from '@/src/constants/typography';
import { MissionCategory, CATEGORY_LABELS } from '@/src/types';
import { updateSettings } from '@/src/utils/database';
import { rescheduleNotifications } from '@/src/utils/notifications';

// 카테고리 순서 정의
const ALL_CATEGORIES: MissionCategory[] = [
  'relationship',
  'selfcare',
  'gratitude',
  'restraint',
  'environment',
  'growth',
];

// 카테고리별 서브레이블
const CATEGORY_SUB: Record<MissionCategory, string> = {
  relationship: '인간관계',
  selfcare: '자기관리',
  gratitude: '감사·배려',
  restraint: '절제',
  environment: '환경·사회',
  growth: '성장',
};

type Step = 1 | 2 | 3;

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>(1);
  const [selectedCategories, setSelectedCategories] = useState<MissionCategory[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [morningHour, setMorningHour] = useState(8);
  const [morningMinute, setMorningMinute] = useState(0);
  const [eveningHour, setEveningHour] = useState(22);
  const [eveningMinute, setEveningMinute] = useState(0);

  // 페이지 전환 페이드 애니메이션
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 단계 이동 시 페이드 전환
  function goToStep(next: Step) {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setStep(next);
  }

  // 카테고리 토글
  function toggleCategory(cat: MissionCategory) {
    setSelectAll(false);
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  // 전체 선택 토글
  function toggleSelectAll() {
    if (selectAll) {
      setSelectAll(false);
      setSelectedCategories([]);
    } else {
      setSelectAll(true);
      setSelectedCategories([...ALL_CATEGORIES]);
    }
  }

  // 시간 조정 헬퍼 (+/- 버튼용)
  function adjustHour(type: 'morning' | 'evening', delta: number) {
    if (type === 'morning') {
      setMorningHour((h) => Math.max(0, Math.min(23, h + delta)));
    } else {
      setEveningHour((h) => Math.max(0, Math.min(23, h + delta)));
    }
  }

  function adjustMinute(type: 'morning' | 'evening', delta: number) {
    if (type === 'morning') {
      setMorningMinute((m) => {
        const next = m + delta;
        if (next < 0) return 50;
        if (next >= 60) return 0;
        return next;
      });
    } else {
      setEveningMinute((m) => {
        const next = m + delta;
        if (next < 0) return 50;
        if (next >= 60) return 0;
        return next;
      });
    }
  }

  // 시간 포맷 "HH:mm"
  function formatTime(h: number, m: number): string {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  // 온보딩 완료 처리
  async function handleComplete() {
    const morningTime = formatTime(morningHour, morningMinute);
    const eveningTime = formatTime(eveningHour, eveningMinute);

    // 설정 저장
    updateSettings({
      onboardingDone: true,
      selectedCategories:
        selectAll || selectedCategories.length === ALL_CATEGORIES.length
          ? 'all'
          : selectedCategories,
      morningTime,
      eveningTime,
      notificationEnabled: true,
    });

    // 알림 예약
    try {
      await rescheduleNotifications(morningTime, eveningTime);
    } catch (e) {
      console.warn('알림 예약 실패:', e);
    }

    // 메인 홈으로 이동
    router.replace('/(tabs)');
  }

  // 2단계 다음 버튼 활성화 조건
  const canProceedStep2 = selectAll || selectedCategories.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 단계 인디케이터 */}
      <View style={styles.stepIndicator}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[
              styles.stepDot,
              s === step && styles.stepDotActive,
              s < step && styles.stepDotPassed,
            ]}
          />
        ))}
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* ── 1단계: 환영 ── */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <View style={styles.welcomeTop}>
              {/* 앱 아이콘 대체 — 선 아이콘 */}
              <View style={styles.logoBox}>
                <Feather name="sun" size={40} color={Colors.accent} />
              </View>

              <Text style={styles.appName}>오늘 하나</Text>
              <Text style={styles.tagline}>
                매일 딱 하나만.{'\n'}어제보다 조금 더 나은 오늘.
              </Text>
            </View>

            <View style={styles.welcomeDesc}>
              <View style={styles.descRow}>
                <Feather name="check-circle" size={18} color={Colors.accent} />
                <Text style={styles.descText}>하루 하나의 작은 약속</Text>
              </View>
              <View style={styles.descRow}>
                <Feather name="repeat" size={18} color={Colors.accent} />
                <Text style={styles.descText}>꾸준함이 만드는 변화</Text>
              </View>
              <View style={styles.descRow}>
                <Feather name="bell" size={18} color={Colors.accent} />
                <Text style={styles.descText}>적절한 시간에 알림</Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.buttonPrimary,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => goToStep(2)}
              accessibilityRole="button"
              accessibilityLabel="시작하기"
            >
              <Text style={styles.buttonPrimaryText}>시작하기</Text>
            </Pressable>
          </View>
        )}

        {/* ── 2단계: 카테고리 선택 ── */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>관심 영역 선택</Text>
              <Text style={styles.stepSub}>
                어떤 분야의 미션을 받고 싶으신가요?{'\n'}최소 1개 이상 선택해주세요.
              </Text>
            </View>

            {/* 전체 선택 버튼 */}
            <Pressable
              style={({ pressed }) => [
                styles.selectAllButton,
                selectAll && styles.selectAllButtonActive,
                pressed && styles.buttonPressed,
              ]}
              onPress={toggleSelectAll}
              accessibilityRole="checkbox"
              accessibilityLabel="전체 선택"
            >
              <Feather
                name={selectAll ? 'check-square' : 'square'}
                size={16}
                color={selectAll ? Colors.accent : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.selectAllText,
                  selectAll && styles.selectAllTextActive,
                ]}
              >
                전체 선택
              </Text>
            </Pressable>

            {/* 카테고리 그리드 (2열) */}
            <View style={styles.categoryGrid}>
              {ALL_CATEGORIES.map((cat) => {
                const isSelected = selectAll || selectedCategories.includes(cat);
                return (
                  <Pressable
                    key={cat}
                    style={({ pressed }) => [
                      styles.categoryCard,
                      isSelected && styles.categoryCardSelected,
                      pressed && styles.buttonPressed,
                      { borderColor: isSelected ? Colors.categories[cat] : Colors.border },
                    ]}
                    onPress={() => toggleCategory(cat)}
                    accessibilityRole="checkbox"
                    accessibilityLabel={CATEGORY_LABELS[cat]}
                  >
                    {/* 선택 체크 */}
                    <View style={styles.categoryCheck}>
                      {isSelected && (
                        <Feather name="check" size={12} color={Colors.categories[cat]} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.categoryName,
                        isSelected && { color: Colors.categories[cat] },
                      ]}
                    >
                      {CATEGORY_LABELS[cat]}
                    </Text>
                    <Text style={styles.categorySub}>{CATEGORY_SUB[cat]}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.bottomRow}>
              <Pressable
                style={styles.backButton}
                onPress={() => goToStep(1)}
                accessibilityRole="button"
                accessibilityLabel="이전으로"
              >
                <Feather name="arrow-left" size={20} color={Colors.textSecondary} />
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.buttonPrimary,
                  styles.buttonFlex,
                  !canProceedStep2 && styles.buttonDisabled,
                  pressed && canProceedStep2 && styles.buttonPressed,
                ]}
                onPress={() => canProceedStep2 && goToStep(3)}
                disabled={!canProceedStep2}
                accessibilityRole="button"
                accessibilityLabel="다음 단계"
              >
                <Text style={styles.buttonPrimaryText}>다음</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── 3단계: 알림 시간 설정 ── */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>알림 시간 설정</Text>
              <Text style={styles.stepSub}>
                미션 알림을 받을 시간을 설정해주세요.{'\n'}나중에 설정에서 변경할 수 있어요.
              </Text>
            </View>

            <ScrollView
              style={styles.timeScrollArea}
              showsVerticalScrollIndicator={false}
            >
              {/* 아침 알림 */}
              <View style={styles.timeCard}>
                <View style={styles.timeCardHeader}>
                  <Feather name="sunrise" size={18} color={Colors.accent} />
                  <Text style={styles.timeCardTitle}>아침 알림</Text>
                </View>
                <Text style={styles.timeCardDesc}>
                  오늘의 미션을 확인하세요
                </Text>
                <TimeAdjuster
                  hour={morningHour}
                  minute={morningMinute}
                  onHourUp={() => adjustHour('morning', 1)}
                  onHourDown={() => adjustHour('morning', -1)}
                  onMinuteUp={() => adjustMinute('morning', 10)}
                  onMinuteDown={() => adjustMinute('morning', -10)}
                />
              </View>

              {/* 저녁 알림 */}
              <View style={styles.timeCard}>
                <View style={styles.timeCardHeader}>
                  <Feather name="moon" size={18} color={Colors.accent} />
                  <Text style={styles.timeCardTitle}>취침 전 알림</Text>
                </View>
                <Text style={styles.timeCardDesc}>
                  오늘 약속을 체크해보세요
                </Text>
                <TimeAdjuster
                  hour={eveningHour}
                  minute={eveningMinute}
                  onHourUp={() => adjustHour('evening', 1)}
                  onHourDown={() => adjustHour('evening', -1)}
                  onMinuteUp={() => adjustMinute('evening', 10)}
                  onMinuteDown={() => adjustMinute('evening', -10)}
                />
              </View>
            </ScrollView>

            <View style={styles.bottomRow}>
              <Pressable
                style={styles.backButton}
                onPress={() => goToStep(2)}
                accessibilityRole="button"
                accessibilityLabel="이전으로"
              >
                <Feather name="arrow-left" size={20} color={Colors.textSecondary} />
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.buttonPrimary,
                  styles.buttonFlex,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleComplete}
                accessibilityRole="button"
                accessibilityLabel="완료"
              >
                <Text style={styles.buttonPrimaryText}>완료</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

// ──────────────────────────────────────────────────────────
// 시간 조정 컴포넌트
// ──────────────────────────────────────────────────────────

interface TimeAdjusterProps {
  hour: number;
  minute: number;
  onHourUp: () => void;
  onHourDown: () => void;
  onMinuteUp: () => void;
  onMinuteDown: () => void;
}

function TimeAdjuster({
  hour,
  minute,
  onHourUp,
  onHourDown,
  onMinuteUp,
  onMinuteDown,
}: TimeAdjusterProps) {
  return (
    <View style={styles.adjusterRow}>
      {/* 시 조정 */}
      <View style={styles.adjusterGroup}>
        <Pressable
          style={({ pressed }) => [styles.adjBtn, pressed && styles.adjBtnPressed]}
          onPress={onHourUp}
          accessibilityLabel="시간 증가"
        >
          <Feather name="chevron-up" size={20} color={Colors.label} />
        </Pressable>
        <Text style={styles.adjValue}>{String(hour).padStart(2, '0')}</Text>
        <Pressable
          style={({ pressed }) => [styles.adjBtn, pressed && styles.adjBtnPressed]}
          onPress={onHourDown}
          accessibilityLabel="시간 감소"
        >
          <Feather name="chevron-down" size={20} color={Colors.label} />
        </Pressable>
      </View>

      <Text style={styles.adjColon}>:</Text>

      {/* 분 조정 (10분 단위) */}
      <View style={styles.adjusterGroup}>
        <Pressable
          style={({ pressed }) => [styles.adjBtn, pressed && styles.adjBtnPressed]}
          onPress={onMinuteUp}
          accessibilityLabel="분 증가"
        >
          <Feather name="chevron-up" size={20} color={Colors.label} />
        </Pressable>
        <Text style={styles.adjValue}>{String(minute).padStart(2, '0')}</Text>
        <Pressable
          style={({ pressed }) => [styles.adjBtn, pressed && styles.adjBtnPressed]}
          onPress={onMinuteDown}
          accessibilityLabel="분 감소"
        >
          <Feather name="chevron-down" size={20} color={Colors.label} />
        </Pressable>
      </View>
    </View>
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

  // 단계 인디케이터
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    paddingBottom: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  stepDotActive: {
    backgroundColor: Colors.accent,
    width: 20,
  },
  stepDotPassed: {
    backgroundColor: Colors.separator,
  },

  // 공통 콘텐츠 래퍼
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },

  // ── 1단계 환영 ──
  welcomeTop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  appName: {
    fontSize: FontSize['3xl'],
    fontWeight: '700',
    color: Colors.label,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: FontSize.md,
    fontWeight: '400',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.md * 1.6,
  },
  welcomeDesc: {
    gap: 14,
    marginBottom: 32,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  descRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  descText: {
    fontSize: FontSize.base,
    color: Colors.label,
    fontWeight: '400',
  },

  // ── 2단계 카테고리 ──
  stepHeader: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Colors.label,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  stepSub: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: FontSize.base * 1.5,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  selectAllButtonActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.white,
  },
  selectAllText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  selectAllTextActive: {
    color: Colors.accent,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    flex: 1,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 80,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  categoryCardSelected: {
    backgroundColor: Colors.white,
  },
  categoryCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.label,
    marginBottom: 2,
  },
  categorySub: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontWeight: '400',
  },

  // ── 3단계 시간 설정 ──
  timeScrollArea: {
    flex: 1,
  },
  timeCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  timeCardTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.label,
  },
  timeCardDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 16,
  },

  // 시간 조정
  adjusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  adjusterGroup: {
    alignItems: 'center',
    gap: 4,
  },
  adjBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjBtnPressed: {
    opacity: 0.6,
  },
  adjValue: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Colors.label,
    letterSpacing: -0.5,
    minWidth: 60,
    textAlign: 'center',
  },
  adjColon: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Colors.label,
    marginTop: -8,
  },

  // 하단 네비게이션 행
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  backButton: {
    width: 52,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // 버튼 — Primary
  buttonPrimary: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  buttonFlex: {
    flex: 1,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    backgroundColor: Colors.disabled,
  },
  buttonPrimaryText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: -0.1,
  },
});
