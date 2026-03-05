// ============================================================
// 오늘 하나 — 알림(Push Notification) 유틸리티
// expo-notifications v0.32 사용
// ============================================================

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 알림 표시 핸들러 설정 (앱 포그라운드에서도 알림 표시)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ──────────────────────────────────────────────────────────
// 권한 요청
// ──────────────────────────────────────────────────────────

/**
 * 알림 권한을 요청한다.
 * 이미 허용되었거나 새로 허용하면 true 반환.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  // 웹 환경에서는 알림 미지원
  if (Platform.OS === 'web') return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ──────────────────────────────────────────────────────────
// 아침 알림 예약
// ──────────────────────────────────────────────────────────

/**
 * 매일 반복 아침 알림을 예약한다.
 * @param time "HH:mm" 형식 (예: "08:00")
 * @param missionText 오늘 미션 짧은 텍스트 (선택)
 */
export async function scheduleMorningNotification(
  time: string,
  missionText?: string
): Promise<void> {
  if (Platform.OS === 'web') return;

  const [hour, minute] = _parseTime(time);

  // 기존 아침 알림 취소
  await _cancelNotificationsByTag('morning');

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '오늘의 미션이 도착했어요',
      body: missionText ?? '오늘 하나의 약속을 확인해보세요.',
      data: { tag: 'morning' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

// ──────────────────────────────────────────────────────────
// 저녁 알림 예약
// ──────────────────────────────────────────────────────────

/**
 * 매일 반복 저녁 알림을 예약한다.
 * @param time "HH:mm" 형식 (예: "22:00")
 */
export async function scheduleEveningNotification(time: string): Promise<void> {
  if (Platform.OS === 'web') return;

  const [hour, minute] = _parseTime(time);

  // 기존 저녁 알림 취소
  await _cancelNotificationsByTag('evening');

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '오늘 약속, 지키셨나요?',
      body: '잠깐 체크해보세요.',
      data: { tag: 'evening' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

// ──────────────────────────────────────────────────────────
// 알림 재등록
// ──────────────────────────────────────────────────────────

/**
 * 기존 알림을 전부 취소하고 새 시간으로 재등록한다.
 * 설정 변경 시 호출.
 */
export async function rescheduleNotifications(
  morningTime: string,
  eveningTime: string
): Promise<void> {
  await cancelAllNotifications();
  await scheduleMorningNotification(morningTime);
  await scheduleEveningNotification(eveningTime);
}

// ──────────────────────────────────────────────────────────
// 전체 취소
// ──────────────────────────────────────────────────────────

/**
 * 예약된 모든 알림을 취소한다.
 */
export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ──────────────────────────────────────────────────────────
// 내부 헬퍼
// ──────────────────────────────────────────────────────────

/** "HH:mm" → [hour, minute] 숫자 배열 변환 */
function _parseTime(time: string): [number, number] {
  const parts = time.split(':');
  const hour = parseInt(parts[0] ?? '8', 10);
  const minute = parseInt(parts[1] ?? '0', 10);
  return [hour, minute];
}

/** 특정 태그의 알림만 취소 */
async function _cancelNotificationsByTag(tag: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.tag === tag) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}
