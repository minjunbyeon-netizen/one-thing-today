// ============================================================
// 오늘 하나 — 루트 레이아웃
// 온보딩 완료 여부에 따라 온보딩 또는 탭 화면으로 분기
// ============================================================

import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
// SafeAreaView는 react-native-safe-area-context 에서 가져온다
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { initDatabase, getSettings } from '@/src/utils/database';
import { requestNotificationPermission } from '@/src/utils/notifications';
import { Colors } from '@/src/constants/colors';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // DB 초기화
        initDatabase();
        const settings = getSettings();
        setOnboardingDone(settings.onboardingDone);

        // 알림 권한 요청 (비동기, 실패해도 앱 진행)
        await requestNotificationPermission();
      } catch (error) {
        console.warn('앱 초기화 오류:', error);
      } finally {
        setIsReady(true);
      }
    }
    prepare();
  }, []);

  // 온보딩 미완료 시 리다이렉트
  useEffect(() => {
    if (isReady && !onboardingDone) {
      router.replace('/onboarding' as any);
    }
  }, [isReady, onboardingDone]);

  // 초기화 중 로딩 화면
  if (!isReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack>
        {/* 온보딩 화면 */}
        <Stack.Screen
          name="onboarding/index"
          options={{ headerShown: false }}
        />
        {/* 메인 탭 화면 */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* 체크인 모달 */}
        <Stack.Screen
          name="checkin"
          options={{
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        {/* 체크인 결과 모달 */}
        <Stack.Screen
          name="checkin-result"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="dark" backgroundColor={Colors.background} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
