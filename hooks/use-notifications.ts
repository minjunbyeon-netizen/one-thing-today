/**
 * useNotifications — 알림 설정/해제
 * expo-notifications 사용 (설치 안된 경우 안전 폴백 제공)
 */
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

// expo-notifications를 optional import
let Notifications: typeof import('expo-notifications') | null = null;
try {
  Notifications = require('expo-notifications');
  if (Notifications?.setNotificationHandler) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }
} catch {
  Notifications = null;
}

let AsyncStorage: typeof import('@react-native-async-storage/async-storage').default | null = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  AsyncStorage = null;
}

const MORNING_KEY = 'ott_notif_morning';
const EVENING_KEY = 'ott_notif_evening';
const MORNING_ID_KEY = 'ott_notif_morning_id';
const EVENING_ID_KEY = 'ott_notif_evening_id';

export type NotifSettings = {
  morningEnabled: boolean;
  eveningEnabled: boolean;
  morningHour: number;
  morningMinute: number;
  eveningHour: number;
  eveningMinute: number;
};

const DEFAULTS: NotifSettings = {
  morningEnabled: false,
  eveningEnabled: false,
  morningHour: 8,
  morningMinute: 0,
  eveningHour: 21,
  eveningMinute: 0,
};

const notifAvailable = Notifications !== null && Platform.OS !== 'web';

export function useNotifications() {
  const [settings, setSettings] = useState<NotifSettings>(DEFAULTS);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      try {
        const morning = await AsyncStorage.getItem(MORNING_KEY);
        const evening = await AsyncStorage.getItem(EVENING_KEY);
        if (morning) setSettings((prev) => ({ ...prev, ...JSON.parse(morning) }));
        if (evening) setSettings((prev) => ({ ...prev, ...JSON.parse(evening) }));
      } catch {}

      if (notifAvailable && Notifications) {
        try {
          const { status } = await Notifications.getPermissionsAsync();
          setPermissionGranted(status === 'granted');
        } catch {}
      }
    })();
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!notifAvailable || !Notifications) return false;
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      setPermissionGranted(granted);
      return granted;
    } catch {
      return false;
    }
  }, []);

  const scheduleDaily = useCallback(async (
    type: 'morning' | 'evening',
    hour: number,
    minute: number,
    enabled: boolean
  ) => {
    const idKey = type === 'morning' ? MORNING_ID_KEY : EVENING_ID_KEY;
    const settingsKey = type === 'morning' ? MORNING_KEY : EVENING_KEY;

    if (notifAvailable && Notifications && AsyncStorage) {
      try {
        const existingId = await AsyncStorage.getItem(idKey);
        if (existingId) {
          await Notifications.cancelScheduledNotificationAsync(existingId);
          await AsyncStorage.removeItem(idKey);
        }

        if (enabled) {
          const body = type === 'morning'
            ? '오늘 하루, 가장 중요한 한 가지를 정해보세요.'
            : '오늘의 한 가지를 완료하셨나요?';
          const title = type === 'morning' ? '오늘의 한 가지 설정' : '오늘의 한 가지 확인';

          const id = await Notifications.scheduleNotificationAsync({
            content: { title, body },
            trigger: {
              type: 'daily' as const,
              hour,
              minute,
            },
          });
          await AsyncStorage.setItem(idKey, id);
        }
      } catch (e) {
        console.warn('[useNotifications] 알림 설정 실패', e);
      }
    }

    const update: Partial<NotifSettings> = type === 'morning'
      ? { morningEnabled: enabled, morningHour: hour, morningMinute: minute }
      : { eveningEnabled: enabled, eveningHour: hour, eveningMinute: minute };

    if (AsyncStorage) {
      try {
        await AsyncStorage.setItem(settingsKey, JSON.stringify(update));
      } catch {}
    }
    setSettings((prev) => ({ ...prev, ...update }));
  }, []);

  return { settings, permissionGranted, requestPermission, scheduleDaily };
}
