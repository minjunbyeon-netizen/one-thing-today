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

const ALL_CATEGORIES: MissionCategory[] = [
  'relationship',
  'selfcare',
  'gratitude',
  'restraint',
  'environment',
  'growth',
];

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
    </Pressable>
  );
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);

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
                value={settings.morningTime}
                onPress={() =>
                  Alert.alert('준비 중', '알림 시간 설정은 다음 업데이트에서 지원됩니다.')
                }
              />
              <View style={styles.rowDivider} />
              <SettingRow
                label="저녁 알림"
                value={settings.eveningTime}
                onPress={() =>
                  Alert.alert('준비 중', '알림 시간 설정은 다음 업데이트에서 지원됩니다.')
                }
              />
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
          <SettingRow label="버전" value="1.0.0" />
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  },
});
