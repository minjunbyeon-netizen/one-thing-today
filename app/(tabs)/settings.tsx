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
    </Pressable>
  );
}

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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  },
});
