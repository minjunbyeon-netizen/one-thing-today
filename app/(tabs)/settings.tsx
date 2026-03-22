<<<<<<< HEAD
/**
 * 설정 화면 — 알림 설정 + 프리미엄 관리
 */
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Switch,
  Pressable,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';

import { useTaskContext } from '@/contexts/TaskContext';
import { useNotifications } from '@/hooks/use-notifications';
import { useColorScheme } from '@/hooks/use-color-scheme';

type RowProps = {
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  isDark: boolean;
};

function SettingRow({ label, sublabel, right, onPress, isDark }: RowProps) {
  const borderColor = isDark ? '#2C2C2E' : '#E5E5EA';
  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, { borderBottomColor: borderColor }]}
    >
      <View style={styles.rowLeft}>
        <ThemedText style={styles.rowLabel}>{label}</ThemedText>
        {sublabel && (
          <ThemedText style={styles.rowSublabel}>{sublabel}</ThemedText>
        )}
      </View>
      {right}
=======
// ============================================================
// 오늘 하나 — 설정 화면
// 알림 시간, 카테고리 선택, 앱 정보
// ============================================================

import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Colors } from '@/src/constants/colors';
import { Typography, FontSize } from '@/src/constants/typography';
import { CATEGORY_LABELS, MissionCategory } from '@/src/types';
import type { AppSettings } from '@/src/types';
import { getSettings, updateSettings } from '@/src/utils/database';
import { rescheduleNotifications } from '@/src/utils/notifications';

const MINUTE_OPTIONS = [0, 10, 20, 30, 40, 50];

const ALL_CATEGORIES: MissionCategory[] = [
  'relationship',
  'selfcare',
  'gratitude',
  'restraint',
  'environment',
  'growth',
];

function TimeEditor({
  hour, minute, onHourUp, onHourDown, onMinuteSelect, onSave, onCancel,
}: {
  hour: number; minute: number;
  onHourUp: () => void; onHourDown: () => void;
  onMinuteSelect: (m: number) => void;
  onSave: () => void; onCancel: () => void;
}) {
  return (
    <View style={styles.timeEditor}>
      {/* 시 조정 */}
      <View style={styles.timeEditorRow}>
        <View style={styles.hourGroup}>
          <Pressable style={({ pressed }) => [styles.hourBtn, pressed && { opacity: 0.6 }]} onPress={onHourUp}>
            <Feather name="chevron-up" size={18} color={Colors.label} />
          </Pressable>
          <Text style={styles.hourValue}>{String(hour).padStart(2, '0')}</Text>
          <Pressable style={({ pressed }) => [styles.hourBtn, pressed && { opacity: 0.6 }]} onPress={onHourDown}>
            <Feather name="chevron-down" size={18} color={Colors.label} />
          </Pressable>
        </View>
        <Text style={styles.timeColon}>:</Text>
        <Text style={styles.hourValue}>{String(minute).padStart(2, '0')}</Text>
      </View>
      {/* 분 선택 */}
      <View style={styles.minuteGrid}>
        {MINUTE_OPTIONS.map((m) => (
          <Pressable
            key={m}
            style={[styles.minuteBtn, minute === m && styles.minuteBtnSelected]}
            onPress={() => onMinuteSelect(m)}
          >
            <Text style={[styles.minuteBtnText, minute === m && styles.minuteBtnTextSelected]}>
              {String(m).padStart(2, '0')}
            </Text>
          </Pressable>
        ))}
      </View>
      {/* 저장/취소 */}
      <View style={styles.timeEditorActions}>
        <Pressable style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>취소</Text>
        </Pressable>
        <Pressable style={styles.saveBtn} onPress={onSave}>
          <Text style={styles.saveBtnText}>저장</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={styles.sectionHeader}>{title}</Text>
  );
}

function SettingRow({
  label,
  value,
  onPress,
  rightElement,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingRow,
        onPress && pressed && styles.settingRowPressed,
      ]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.settingRight}>
        {rightElement ?? (
          <>
            {value ? (
              <Text style={styles.settingValue}>{value}</Text>
            ) : null}
            {onPress ? (
              <Feather name="chevron-right" size={16} color={Colors.textTertiary} />
            ) : null}
          </>
        )}
      </View>
>>>>>>> 81e4fa17891f5698fdcc40dace9599ffcd69b235
    </Pressable>
  );
}

<<<<<<< HEAD
function SectionHeader({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <ThemedText style={[styles.sectionTitle, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>
      {title}
    </ThemedText>
  );
}

/**
 * 시간 변경 다이얼로그 — Alert 기반 시/분 입력
 * DateTimePickerModal 미설치 환경 대응: 정수 입력 방식으로 시간 설정
 */
function showTimePickerAlert(
  type: 'morning' | 'evening',
  currentHour: number,
  currentMinute: number,
  onConfirm: (hour: number, minute: number) => void
) {
  const label = type === 'morning' ? '아침 리마인더' : '저녁 리마인더';
  const hourOptions = type === 'morning'
    ? [5, 6, 7, 8, 9, 10, 11]
    : [18, 19, 20, 21, 22, 23];

  // Alert.alert 버튼으로 시간 선택 옵션 제공
  const buttons = hourOptions.map((h) => ({
    text: type === 'morning'
      ? `오전 ${h}:${String(currentMinute).padStart(2, '0')}`
      : `오후 ${h - 12}:${String(currentMinute).padStart(2, '0')} (${h}시)`,
    onPress: () => onConfirm(h, currentMinute),
  }));

  buttons.push({ text: '취소', onPress: () => {} });

  Alert.alert(
    `${label} 시간 변경`,
    `현재: ${type === 'morning' ? `오전 ${currentHour}:${String(currentMinute).padStart(2, '0')}` : `오후 ${currentHour - 12}:${String(currentMinute).padStart(2, '0')}`}\n원하는 시간을 선택하세요.`,
    buttons
  );
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isPremium, plan, deactivatePremium } = useTaskContext();
  const { settings, permissionGranted, requestPermission, scheduleDaily } = useNotifications();

  const bgColor = isDark ? '#0F0F0F' : '#F2F2F7';
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1C1C1E';

  const handleMorningToggle = async (value: boolean) => {
    if (value && !permissionGranted) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert('알림 권한 필요', '설정에서 알림 권한을 허용해주세요.');
        return;
      }
    }
    await scheduleDaily('morning', settings.morningHour, settings.morningMinute, value);
  };

  const handleEveningToggle = async (value: boolean) => {
    if (value && !permissionGranted) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert('알림 권한 필요', '설정에서 알림 권한을 허용해주세요.');
        return;
      }
    }
    await scheduleDaily('evening', settings.eveningHour, settings.eveningMinute, value);
  };

  const handleMorningTimePress = () => {
    if (Platform.OS === 'web') {
      Alert.alert('알림 시간 변경', '모바일 앱에서 시간을 변경할 수 있습니다.');
      return;
    }
    showTimePickerAlert(
      'morning',
      settings.morningHour,
      settings.morningMinute,
      async (hour, minute) => {
        await scheduleDaily('morning', hour, minute, settings.morningEnabled);
      }
    );
  };

  const handleEveningTimePress = () => {
    if (Platform.OS === 'web') {
      Alert.alert('알림 시간 변경', '모바일 앱에서 시간을 변경할 수 있습니다.');
      return;
    }
    showTimePickerAlert(
      'evening',
      settings.eveningHour,
      settings.eveningMinute,
      async (hour, minute) => {
        await scheduleDaily('evening', hour, minute, settings.eveningEnabled);
      }
    );
  };

  const handleDeactivate = () => {
    Alert.alert(
      '프리미엄 해제',
      '프리미엄을 해제하시겠어요? 일부 기능이 제한됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '해제',
          style: 'destructive',
          onPress: () => deactivatePremium(),
        },
      ]
    );
  };

  const planLabel: Record<string, string> = {
    monthly: '월간 구독',
    yearly: '연간 구독',
    lifetime: '평생 이용권',
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText style={[styles.headerTitle, { color: textColor }]}>
          {'설정'}
        </ThemedText>

        {/* 프리미엄 섹션 */}
        <SectionHeader title="프리미엄" isDark={isDark} />
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          {isPremium ? (
            <>
              <SettingRow
                label="현재 플랜"
                sublabel={plan ? planLabel[plan] : '프리미엄'}
                right={
                  <View style={styles.proBadge}>
                    <ThemedText style={styles.proBadgeText}>{'PRO'}</ThemedText>
                  </View>
                }
                isDark={isDark}
              />
              <SettingRow
                label="프리미엄 해제"
                onPress={handleDeactivate}
                right={<ThemedText style={styles.chevron}>{'›'}</ThemedText>}
                isDark={isDark}
              />
            </>
          ) : (
            <Pressable
              style={styles.upgradeButton}
              onPress={() => router.push('/modal/premium')}
            >
              <ThemedText style={styles.upgradeIcon}>{'✨'}</ThemedText>
              <View style={styles.upgradeTextWrap}>
                <ThemedText style={styles.upgradeTitle}>{'프리미엄 업그레이드'}</ThemedText>
                <ThemedText style={styles.upgradeSubtitle}>
                  {'히스토리 무제한 · 테마 · 위젯 · 동기화'}
                </ThemedText>
              </View>
              <ThemedText style={styles.chevron}>{'›'}</ThemedText>
            </Pressable>
          )}
        </View>

        {/* 알림 섹션 */}
        <SectionHeader title="알림" isDark={isDark} />
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <SettingRow
            label="아침 리마인더"
            sublabel={`오전 ${settings.morningHour}:${String(settings.morningMinute).padStart(2, '0')} — 탭하여 시간 변경`}
            onPress={handleMorningTimePress}
            right={
              <Switch
                value={settings.morningEnabled}
                onValueChange={handleMorningToggle}
                trackColor={{ true: '#6C63FF' }}
                disabled={Platform.OS === 'web'}
              />
            }
            isDark={isDark}
          />
          <SettingRow
            label="저녁 리마인더"
            sublabel={`오후 ${settings.eveningHour - 12}:${String(settings.eveningMinute).padStart(2, '0')} — 탭하여 시간 변경`}
            onPress={handleEveningTimePress}
            right={
              <Switch
                value={settings.eveningEnabled}
                onValueChange={handleEveningToggle}
                trackColor={{ true: '#6C63FF' }}
                disabled={Platform.OS === 'web'}
              />
            }
            isDark={isDark}
          />
        </View>

        {/* 앱 정보 */}
        <SectionHeader title="앱 정보" isDark={isDark} />
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <SettingRow
            label="버전"
            right={<ThemedText style={styles.versionText}>{'1.0.0'}</ThemedText>}
            isDark={isDark}
          />
          <SettingRow
            label="개인정보처리방침"
            right={<ThemedText style={styles.chevron}>{'›'}</ThemedText>}
            isDark={isDark}
          />
          <SettingRow
            label="이용약관"
            right={<ThemedText style={styles.chevron}>{'›'}</ThemedText>}
            isDark={isDark}
          />
=======
export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [editingTime, setEditingTime] = useState<'morning' | 'evening' | null>(null);
  const [editHour, setEditHour] = useState(8);
  const [editMinute, setEditMinute] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  function loadSettings() {
    try {
      const s = getSettings();
      setSettings(s);
    } catch (error) {
      console.warn('설정 로드 오류:', error);
    }
  }

  function handleEditTime(type: 'morning' | 'evening') {
    if (!settings) return;
    const timeStr = type === 'morning' ? settings.morningTime : settings.eveningTime;
    const [h, m] = timeStr.split(':').map(Number);
    setEditHour(h ?? 8);
    setEditMinute(m ?? 0);
    setEditingTime(editingTime === type ? null : type);
  }

  async function handleSaveTime() {
    if (!settings || !editingTime) return;
    const timeStr = `${String(editHour).padStart(2, '0')}:${String(editMinute).padStart(2, '0')}`;
    const updated = editingTime === 'morning'
      ? { ...settings, morningTime: timeStr }
      : { ...settings, eveningTime: timeStr };
    setSettings(updated);
    updateSettings(editingTime === 'morning' ? { morningTime: timeStr } : { eveningTime: timeStr });
    setEditingTime(null);
    try {
      await rescheduleNotifications(updated.morningTime, updated.eveningTime);
    } catch (e) {
      console.warn('알림 재예약 실패', e);
    }
  }

  function handleToggleNotification(value: boolean) {
    if (!settings) return;
    const updated = { ...settings, notificationEnabled: value };
    setSettings(updated);
    updateSettings({ notificationEnabled: value });
  }

  function handleCategoryToggle(category: MissionCategory) {
    if (!settings) return;

    const current = settings.selectedCategories;
    let next: MissionCategory[] | 'all';

    if (current === 'all') {
      // 전체 → 해당 카테고리만 제외
      next = ALL_CATEGORIES.filter((c) => c !== category);
    } else {
      const arr = current as MissionCategory[];
      if (arr.includes(category)) {
        // 제거
        const removed = arr.filter((c) => c !== category);
        // 마지막 하나는 제거 불가
        if (removed.length === 0) {
          Alert.alert('알림', '최소 1개 이상의 카테고리를 선택해야 합니다.');
          return;
        }
        // 전부 선택되면 'all'로
        next = removed.length === ALL_CATEGORIES.length ? 'all' : removed;
      } else {
        // 추가
        const added = [...arr, category];
        next = added.length === ALL_CATEGORIES.length ? 'all' : added;
      }
    }

    const updated = { ...settings, selectedCategories: next };
    setSettings(updated);
    updateSettings({ selectedCategories: next });
  }

  function isCategorySelected(category: MissionCategory): boolean {
    if (!settings) return true;
    if (settings.selectedCategories === 'all') return true;
    return (settings.selectedCategories as MissionCategory[]).includes(category);
  }

  if (!settings) {
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
        {/* 화면 제목 */}
        <Text style={styles.screenTitle}>설정</Text>

        {/* 알림 섹션 */}
        <SectionHeader title="알림" />
        <Text style={styles.sectionDesc}>아침엔 오늘의 미션을, 저녁엔 체크인 알림을 받아요.</Text>
        <View style={styles.card}>
          <SettingRow
            label="알림 사용"
            rightElement={
              <Switch
                value={settings.notificationEnabled}
                onValueChange={handleToggleNotification}
                trackColor={{ false: Colors.border, true: Colors.accent }}
                thumbColor={Colors.white}
              />
            }
          />
          {settings.notificationEnabled && (
            <>
              <View style={styles.rowDivider} />
              <SettingRow
                label="아침 알림"
                value={editingTime === 'morning' ? `${String(editHour).padStart(2,'0')}:${String(editMinute).padStart(2,'0')}` : settings.morningTime}
                onPress={() => handleEditTime('morning')}
                rightElement={
                  <Feather
                    name={editingTime === 'morning' ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={Colors.textTertiary}
                  />
                }
              />
              {editingTime === 'morning' && (
                <TimeEditor
                  hour={editHour}
                  minute={editMinute}
                  onHourUp={() => setEditHour(h => Math.min(23, h + 1))}
                  onHourDown={() => setEditHour(h => Math.max(0, h - 1))}
                  onMinuteSelect={(m) => setEditMinute(m)}
                  onSave={handleSaveTime}
                  onCancel={() => setEditingTime(null)}
                />
              )}
              <View style={styles.rowDivider} />
              <SettingRow
                label="저녁 알림"
                value={editingTime === 'evening' ? `${String(editHour).padStart(2,'0')}:${String(editMinute).padStart(2,'0')}` : settings.eveningTime}
                onPress={() => handleEditTime('evening')}
                rightElement={
                  <Feather
                    name={editingTime === 'evening' ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={Colors.textTertiary}
                  />
                }
              />
              {editingTime === 'evening' && (
                <TimeEditor
                  hour={editHour}
                  minute={editMinute}
                  onHourUp={() => setEditHour(h => Math.min(23, h + 1))}
                  onHourDown={() => setEditHour(h => Math.max(0, h - 1))}
                  onMinuteSelect={(m) => setEditMinute(m)}
                  onSave={handleSaveTime}
                  onCancel={() => setEditingTime(null)}
                />
              )}
            </>
          )}
        </View>

        {/* 카테고리 섹션 */}
        <SectionHeader title="미션 카테고리" />
        <Text style={styles.sectionDesc}>
          원하는 카테고리에서만 미션을 받아보세요.
        </Text>
        <View style={styles.categoryGrid}>
          {ALL_CATEGORIES.map((cat) => {
            const selected = isCategorySelected(cat);
            return (
              <Pressable
                key={cat}
                style={({ pressed }) => [
                  styles.categoryChip,
                  selected && styles.categoryChipSelected,
                  pressed && styles.categoryChipPressed,
                ]}
                onPress={() => handleCategoryToggle(cat)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
              >
                {selected && (
                  <Feather name="check" size={12} color={Colors.white} />
                )}
                <Text
                  style={[
                    styles.categoryChipText,
                    selected && styles.categoryChipTextSelected,
                  ]}
                >
                  {CATEGORY_LABELS[cat]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 앱 정보 섹션 */}
        <SectionHeader title="앱 정보" />
        <View style={styles.card}>
          <SettingRow label="버전" value="1.5.0" />
          <View style={styles.rowDivider} />
          <SettingRow
            label="문의하기"
            onPress={() =>
              Alert.alert('문의', '이 기능은 준비 중입니다.')
            }
          />
          <View style={styles.rowDivider} />
          <SettingRow
            label="온보딩 다시 보기"
            onPress={() =>
              Alert.alert('준비 중', '다음 업데이트에서 지원됩니다.')
            }
          />
        </View>

        {/* 하단 여백 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>오늘 하나 (One Thing Today)</Text>
          <Text style={styles.footerSubText}>
            매일 하나의 약속으로 더 나은 하루를
          </Text>
>>>>>>> 81e4fa17891f5698fdcc40dace9599ffcd69b235
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  safe: { flex: 1 },
  scroll: {
    padding: 20,
    paddingBottom: 48,
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 16,
    marginBottom: 6,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
=======
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },

  // 화면 제목
  screenTitle: {
    ...Typography.screenTitle,
    color: Colors.label,
    marginBottom: 24,
  },

  // 섹션
  sectionHeader: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 24,
  },
  sectionDesc: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginBottom: 12,
    lineHeight: FontSize.sm * 1.5,
  },

  // 카드
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 16,
  },

  // 설정 행
  settingRow: {
>>>>>>> 81e4fa17891f5698fdcc40dace9599ffcd69b235
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
<<<<<<< HEAD
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 16,
  },
  rowSublabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
  chevron: {
    fontSize: 20,
    color: '#C7C7CC',
    marginLeft: 8,
  },
  proBadge: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  upgradeIcon: {
    fontSize: 24,
  },
  upgradeTextWrap: {
    flex: 1,
    gap: 2,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C63FF',
  },
  upgradeSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  versionText: {
    fontSize: 14,
    color: '#8E8E93',
=======
    minHeight: 52,
  },
  settingRowPressed: {
    backgroundColor: Colors.background,
  },
  settingLabel: {
    fontSize: FontSize.base,
    fontWeight: '400',
    color: Colors.label,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingValue: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },

  // 카테고리 그리드
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  categoryChipSelected: {
    backgroundColor: Colors.label,
    borderColor: Colors.label,
  },
  categoryChipPressed: {
    opacity: 0.7,
  },
  categoryChipText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: Colors.white,
  },

  // 시간 편집기
  timeEditor: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  timeEditorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  hourGroup: { alignItems: 'center', gap: 4 },
  hourBtn: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  hourValue: {
    fontSize: FontSize['2xl'], fontWeight: '700',
    color: Colors.label, letterSpacing: -0.5, minWidth: 52, textAlign: 'center',
  },
  timeColon: {
    fontSize: FontSize['2xl'], fontWeight: '700', color: Colors.label,
  },
  minuteGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center',
  },
  minuteBtn: {
    width: '30%', paddingVertical: 10, borderRadius: 8,
    backgroundColor: Colors.white, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  minuteBtnSelected: { backgroundColor: Colors.label, borderColor: Colors.label },
  minuteBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.label },
  minuteBtnTextSelected: { color: Colors.white },
  timeEditorActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: FontSize.base, color: Colors.textSecondary, fontWeight: '500' },
  saveBtn: {
    flex: 2, paddingVertical: 12, borderRadius: 10,
    backgroundColor: Colors.accent, alignItems: 'center',
  },
  saveBtnText: { fontSize: FontSize.base, color: Colors.white, fontWeight: '600' },

  // 푸터
  footer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  footerSubText: {
    fontSize: FontSize.xs,
    color: Colors.disabled,
>>>>>>> 81e4fa17891f5698fdcc40dace9599ffcd69b235
  },
});
