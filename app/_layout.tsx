<<<<<<< HEAD
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
// AsyncStorage optional import
let AsyncStorage: { getItem: (k: string) => Promise<string | null> } | null = null;
try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}

import { useColorScheme } from '@/hooks/use-color-scheme';
import { TaskProvider } from '@/contexts/TaskContext';

const ONBOARDING_KEY = 'ott_onboarding_done';
=======
// ============================================================
// 오늘 하나 — 루트 레이아웃
// 온보딩 완료 여부에 따라 온보딩 또는 탭 화면으로 분기
// ============================================================

import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

import { initDatabase, getSettings } from '@/src/utils/database';
import { requestNotificationPermission } from '@/src/utils/notifications';
import { Colors } from '@/src/constants/colors';
import { FontSize } from '@/src/constants/typography';
>>>>>>> 81e4fa17891f5698fdcc40dace9599ffcd69b235

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
<<<<<<< HEAD
  const colorScheme = useColorScheme();
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const done = await AsyncStorage?.getItem(ONBOARDING_KEY);
      if (!done) {
        router.replace('/onboarding');
      }
      setOnboardingChecked(true);
    })();
  }, []);

  if (!onboardingChecked) return null; // 체크 완료 전까지 렌더 블로킹

  return (
    <TaskProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="onboarding"
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen
            name="modal/premium"
            options={{
              presentation: 'modal',
              title: '프리미엄',
              headerShown: true,
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </TaskProvider>
  );
}
=======
  const [isReady, setIsReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  // 스플래시 애니메이션
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 로고 등장 애니메이션
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();

    async function prepare() {
      try {
        initDatabase();
        const settings = getSettings();
        setOnboardingDone(settings.onboardingDone);
        await requestNotificationPermission();
      } catch (error) {
        console.warn('앱 초기화 오류:', error);
      } finally {
        // 최소 1초 스플래시 노출
        setTimeout(() => setIsReady(true), 1000);
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

  // 스플래시 화면
  if (!isReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.splash}>
          <Animated.View style={[styles.splashContent, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
            <View style={styles.splashLogo}>
              <Feather name="sun" size={40} color={Colors.accent} />
            </View>
            <Text style={styles.splashTitle}>오늘 하나</Text>
            <Text style={styles.splashSub}>One Thing Today</Text>
          </Animated.View>
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
      </Stack>
      <StatusBar style="dark" backgroundColor={Colors.background} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  splashContent: {
    alignItems: 'center',
    gap: 12,
  },
  splashLogo: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 8,
  },
  splashTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Colors.label,
    letterSpacing: -0.5,
  },
  splashSub: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
});
>>>>>>> 81e4fa17891f5698fdcc40dace9599ffcd69b235
