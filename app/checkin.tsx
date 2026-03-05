// ============================================================
// 오늘 하나 — 체크인 모달 화면
// 오늘 미션에 대한 완료/미완료 기록 + 메모 입력
// ============================================================

import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';

import { Colors } from '@/src/constants/colors';
import { Typography, FontSize } from '@/src/constants/typography';
import { CATEGORY_LABELS } from '@/src/types';
import type { CheckIn } from '@/src/types';
import { getSettings, getCheckin, saveCheckin } from '@/src/utils/database';
import { getTodayMission } from '@/src/utils/missionSelector';

// 오늘 날짜 YYYY-MM-DD
function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

type SelectedStatus = 'done' | 'undone' | null;

export default function CheckinScreen() {
  const today = getToday();

  const settings = getSettings();
  const mission = getTodayMission(settings);
  const existingCheckin = getCheckin(today);

  // 이미 체크인 완료 여부
  const isAlreadyDone =
    existingCheckin?.status === 'done' || existingCheckin?.status === 'undone';

  // 선택 상태 ('done' | 'undone' | null)
  const [selectedStatus, setSelectedStatus] = useState<SelectedStatus>(
    existingCheckin ? (existingCheckin.status === 'skipped' ? null : existingCheckin.status as SelectedStatus) : null
  );
  const [memo, setMemo] = useState(existingCheckin?.memo ?? '');
  const [isSaved, setIsSaved] = useState(false);

  // 저장 완료 애니메이션
  const successAnim = useRef(new Animated.Value(0)).current;

  // 저장 완료 후 홈으로 이동 (1.2초 후)
  useEffect(() => {
    if (isSaved) {
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        router.back();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isSaved]);

  // 상태 선택
  async function handleSelect(status: 'done' | 'undone') {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(
        status === 'done'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light
      );
    }
    setSelectedStatus(status);
  }

  // 저장
  async function handleSave() {
    if (!selectedStatus) return;

    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      saveCheckin(
        today,
        mission.id,
        mission.text,
        mission.category,
        selectedStatus,
        memo.trim() || undefined
      );
      setIsSaved(true);
    } catch (error) {
      console.warn('체크인 저장 오류:', error);
    }
  }

  // 닫기
  function handleClose() {
    router.back();
  }

  // 저장 완료 화면
  if (isSaved) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[styles.successContainer, { opacity: successAnim }]}
        >
          <Feather
            name={selectedStatus === 'done' ? 'check-circle' : 'circle'}
            size={56}
            color={selectedStatus === 'done' ? Colors.success : Colors.textSecondary}
          />
          <Text style={styles.successTitle}>
            {selectedStatus === 'done' ? '기록했어요!' : '괜찮아요.'}
          </Text>
          <Text style={styles.successSub}>
            {selectedStatus === 'done'
              ? '오늘의 약속을 지켰군요.'
              : '내일 다시 도전해봐요.'}
          </Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>약속, 어떻게 됐나요?</Text>
          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="닫기"
          >
            <Feather name="x" size={22} color={Colors.label} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 미션 카드 (읽기 전용) */}
          <View style={styles.missionCard}>
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
            <Text style={styles.missionText}>{mission.shortText ?? mission.text}</Text>
          </View>

          {/* 상태 선택 섹션 */}
          <Text style={styles.sectionLabel}>오늘 어떠셨나요?</Text>

          {/* 지켰어요 버튼 */}
          <Pressable
            style={({ pressed }) => [
              styles.statusButton,
              selectedStatus === 'done' && styles.statusButtonDone,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => handleSelect('done')}
            accessibilityRole="radio"
            accessibilityLabel="지켰어요"
          >
            <View style={styles.statusButtonInner}>
              <View
                style={[
                  styles.statusIcon,
                  selectedStatus === 'done' && styles.statusIconDone,
                ]}
              >
                <Feather
                  name="check"
                  size={18}
                  color={
                    selectedStatus === 'done' ? Colors.white : Colors.textTertiary
                  }
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.statusButtonText,
                    selectedStatus === 'done' && styles.statusButtonTextDone,
                  ]}
                >
                  지켰어요
                </Text>
                <Text style={styles.statusButtonSub}>오늘 약속을 지켰어요</Text>
              </View>
            </View>
            {selectedStatus === 'done' && (
              <Feather name="check-circle" size={20} color={Colors.success} />
            )}
          </Pressable>

          {/* 못 지켰어요 버튼 */}
          <Pressable
            style={({ pressed }) => [
              styles.statusButton,
              selectedStatus === 'undone' && styles.statusButtonUndone,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => handleSelect('undone')}
            accessibilityRole="radio"
            accessibilityLabel="못 지켰어요"
          >
            <View style={styles.statusButtonInner}>
              <View
                style={[
                  styles.statusIcon,
                  selectedStatus === 'undone' && styles.statusIconUndone,
                ]}
              >
                <Feather
                  name="x"
                  size={18}
                  color={
                    selectedStatus === 'undone' ? Colors.white : Colors.textTertiary
                  }
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.statusButtonText,
                    selectedStatus === 'undone' && styles.statusButtonTextUndone,
                  ]}
                >
                  못 지켰어요
                </Text>
                <Text style={styles.statusButtonSub}>오늘은 아쉽게도 못 했어요</Text>
              </View>
            </View>
            {selectedStatus === 'undone' && (
              <Feather name="circle" size={20} color={Colors.textSecondary} />
            )}
          </Pressable>

          {/* 메모 입력 */}
          <View style={styles.memoSection}>
            <Text style={styles.sectionLabel}>메모 (선택)</Text>
            <TextInput
              style={styles.memoInput}
              placeholder="오늘의 소감이나 기록을 남겨보세요."
              placeholderTextColor={Colors.textTertiary}
              multiline
              maxLength={200}
              value={memo}
              onChangeText={setMemo}
              textAlignVertical="top"
              accessibilityLabel="메모 입력"
            />
            <Text style={styles.memoCount}>{memo.length} / 200</Text>
          </View>
        </ScrollView>

        {/* 저장 버튼 */}
        <View style={styles.saveArea}>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              !selectedStatus && styles.saveButtonDisabled,
              pressed && selectedStatus && styles.buttonPressed,
            ]}
            onPress={handleSave}
            disabled={!selectedStatus}
            accessibilityRole="button"
            accessibilityLabel="저장하기"
          >
            <Text
              style={[
                styles.saveButtonText,
                !selectedStatus && styles.saveButtonTextDisabled,
              ]}
            >
              저장하기
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },

  // 저장 완료 화면
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  successTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.label,
    letterSpacing: -0.3,
    marginTop: 8,
  },
  successSub: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.label,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnPressed: {
    opacity: 0.6,
  },

  // 스크롤
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },

  // 미션 카드
  missionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  missionText: {
    fontSize: FontSize.base,
    fontWeight: '500',
    color: Colors.label,
    lineHeight: FontSize.base * 1.6,
  },

  // 섹션 레이블
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    marginBottom: 12,
    textTransform: 'uppercase',
  },

  // 상태 선택 버튼
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  statusButtonDone: {
    borderColor: Colors.success,
    backgroundColor: '#F0FFF4',
  },
  statusButtonUndone: {
    borderColor: Colors.separator,
    backgroundColor: Colors.white,
  },
  statusButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIconDone: {
    backgroundColor: Colors.success,
  },
  statusIconUndone: {
    backgroundColor: Colors.separator,
  },
  statusButtonText: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.label,
    marginBottom: 2,
  },
  statusButtonTextDone: {
    color: Colors.success,
  },
  statusButtonTextUndone: {
    color: Colors.textSecondary,
  },
  statusButtonSub: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontWeight: '400',
  },

  // 메모
  memoSection: {
    marginTop: 12,
  },
  memoInput: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    fontSize: FontSize.base,
    color: Colors.label,
    minHeight: 100,
    lineHeight: FontSize.base * 1.5,
  },
  memoCount: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: 6,
  },

  // 저장 버튼
  saveArea: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  saveButton: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  saveButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: -0.1,
  },
  saveButtonTextDisabled: {
    color: Colors.white,
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
