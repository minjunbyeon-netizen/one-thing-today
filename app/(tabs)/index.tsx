/**
 * 홈 화면 — 오늘의 한 가지
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CheckButton } from '@/components/check-button';
import { StreakBadge } from '@/components/streak-badge';
import { useTaskContext } from '@/contexts/TaskContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return '새벽이에요';
  if (h < 12) return '좋은 아침이에요';
  if (h < 18) return '좋은 오후예요';
  return '좋은 저녁이에요';
}

function formatToday(): string {
  const d = new Date();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return `${month}월 ${day}일 ${weekdays[d.getDay()]}`;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const {
    task,
    taskLoading,
    updateTitle,
    updateNote,
    toggleComplete,
    streak,
    isPremium,
  } = useTaskContext();

  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const titleRef = useRef<TextInput>(null);

  const completedScale = useSharedValue(1);
  const completedOpacity = useSharedValue(1);

  const completedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: completedScale.value }],
    opacity: completedOpacity.value,
  }));

  const handleEditStart = useCallback(() => {
    setTitleDraft(task?.title ?? '');
    setNoteDraft(task?.note ?? '');
    setEditing(true);
    setTimeout(() => titleRef.current?.focus(), 100);
  }, [task]);

  const handleSave = useCallback(async () => {
    await updateTitle(titleDraft.trim());
    await updateNote(noteDraft.trim());
    setEditing(false);
  }, [titleDraft, noteDraft, updateTitle, updateNote]);

  const handleToggle = useCallback(async () => {
    await toggleComplete();
  }, [toggleComplete]);

  const bgColor = isDark ? '#0F0F0F' : '#FAFAFA';
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const borderColor = isDark ? '#2C2C2E' : '#E5E5EA';
  const placeholderColor = isDark ? '#555' : '#BBBBBB';
  const textColor = isDark ? '#FFFFFF' : '#1C1C1E';
  const subColor = isDark ? '#8E8E93' : '#8E8E93';

  if (taskLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]}>
        <ActivityIndicator style={{ marginTop: 80 }} color="#6C63FF" />
      </SafeAreaView>
    );
  }

  const isCompleted = task?.completed === 1;
  const hasTitle = (task?.title ?? '').trim().length > 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* 헤더 */}
          <View style={styles.header}>
            <View>
              <ThemedText style={[styles.greeting, { color: subColor }]}>
                {getGreeting()}
              </ThemedText>
              <ThemedText style={[styles.dateText, { color: textColor }]}>
                {formatToday()}
              </ThemedText>
            </View>
            {streak > 0 && <StreakBadge streak={streak} size="medium" />}
          </View>

          {/* 메인 카드 */}
          <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <ThemedText style={[styles.cardLabel, { color: subColor }]}>
              {'오늘의 한 가지'}
            </ThemedText>

            {editing ? (
              /* 편집 모드 */
              <View style={styles.editContainer}>
                <TextInput
                  ref={titleRef}
                  style={[styles.titleInput, { color: textColor, borderColor }]}
                  value={titleDraft}
                  onChangeText={setTitleDraft}
                  placeholder="오늘 반드시 해야 할 한 가지는?"
                  placeholderTextColor={placeholderColor}
                  multiline
                  maxLength={100}
                  returnKeyType="next"
                  autoFocus
                />
                <TextInput
                  style={[styles.noteInput, { color: textColor, borderColor }]}
                  value={noteDraft}
                  onChangeText={setNoteDraft}
                  placeholder="메모 (선택)"
                  placeholderTextColor={placeholderColor}
                  multiline
                  maxLength={200}
                />
                <View style={styles.editButtons}>
                  <Pressable
                    style={[styles.editBtn, styles.cancelBtn, { borderColor }]}
                    onPress={() => setEditing(false)}
                  >
                    <ThemedText style={{ color: subColor, fontWeight: '600' }}>
                      {'취소'}
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.editBtn, styles.saveBtn]}
                    onPress={handleSave}
                  >
                    <ThemedText style={styles.saveBtnText}>{'저장'}</ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : (
              /* 표시 모드 */
              <Pressable onPress={handleEditStart} style={styles.taskDisplay}>
                {hasTitle ? (
                  <>
                    <ThemedText
                      style={[
                        styles.taskTitle,
                        { color: textColor },
                        isCompleted && styles.completedTitle,
                      ]}
                    >
                      {task?.title}
                    </ThemedText>
                    {task?.note ? (
                      <ThemedText style={[styles.taskNote, { color: subColor }]}>
                        {task.note}
                      </ThemedText>
                    ) : null}
                  </>
                ) : (
                  <ThemedText style={[styles.emptyPrompt, { color: placeholderColor }]}>
                    {'탭해서 오늘의 한 가지를 입력하세요 ✏️'}
                  </ThemedText>
                )}
              </Pressable>
            )}
          </View>

          {/* 완료 버튼 영역 */}
          {hasTitle && !editing && (
            <Animated.View style={[styles.checkArea, completedStyle]}>
              <CheckButton
                completed={isCompleted}
                onToggle={handleToggle}
                size={72}
              />
              <ThemedText style={[styles.checkLabel, { color: subColor }]}>
                {isCompleted ? '완료했어요! 🎉' : '완료하면 체크하세요'}
              </ThemedText>
            </Animated.View>
          )}

          {/* 완료 시 격려 메시지 */}
          {isCompleted && (
            <View style={[styles.celebCard, { backgroundColor: '#6C63FF15', borderColor: '#6C63FF40' }]}>
              <ThemedText style={styles.celebText}>
                {'오늘의 가장 중요한 한 가지를\n완수했어요. 대단해요! ✨'}
              </ThemedText>
            </View>
          )}

          {/* 프리미엄 유도 — streak 7일 달성 */}
          {!isPremium && streak >= 7 && (
            <Pressable
              style={[styles.promoCard, { backgroundColor: '#FF6B3515', borderColor: '#FF6B3540' }]}
              onPress={() => router.push('/modal/premium')}
            >
              <ThemedText style={styles.promoText}>
                {'🔥 7일 연속 달성! 프리미엄으로 업그레이드하면\n무제한 기록 + 더 많은 기능을 사용할 수 있어요.'}
              </ThemedText>
              <ThemedText style={styles.promoLink}>{'자세히 보기 →'}</ThemedText>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 22,
    fontWeight: '700',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    minHeight: 160,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  taskDisplay: {
    flex: 1,
    minHeight: 80,
    justifyContent: 'center',
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  taskNote: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  emptyPrompt: {
    fontSize: 16,
    lineHeight: 24,
  },
  editContainer: {
    gap: 12,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  noteInput: {
    fontSize: 15,
    lineHeight: 22,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  editBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  saveBtn: {
    backgroundColor: '#6C63FF',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  checkArea: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  checkLabel: {
    fontSize: 14,
  },
  celebCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  celebText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  promoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  promoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  promoLink: {
    color: '#FF6B35',
    fontWeight: '600',
    fontSize: 14,
  },
});
